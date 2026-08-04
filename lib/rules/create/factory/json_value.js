/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

const { allEmpty, noneEmpty } = require("../../../utils/empty.js");
const { visit } = require("../../../utils/json_ast.js");
const toPath = require("lodash").toPath;

module.exports = function (options) {
  function compileRegex(value) {
    try {
      return new RegExp(value.value, true == value.ignoreCase ? "i" : undefined);
    } catch (e) {
      throw new Error(`check-json-value: invalid regex "${value.value}" (${e.message})`, { cause: e });
    }
  }

  function isMatch(data, values, allMatch = true) {
    function shouldBreak(isMatch) {
      return (true === allMatch && false === isMatch) || (false === allMatch && true === isMatch);
    }

    let match = allMatch;

    for (const value of values) {
      if ("string" === value.type) {
        const reg = compileRegex(value);

        if (shouldBreak("string" === typeof data.value && reg.test(data.value))) {
          match = !match;
          break;
        }
      } else if ("number" === value.type) {
        if ("string" === typeof value.value) {
          const reg = compileRegex(value);

          if (shouldBreak(reg.test(String(data.value)))) {
            match = !match;
            break;
          }
        } else if (shouldBreak(value.value === data.value)) {
          match = !match;
          break;
        }
      } else if ("boolean" === value.type) {
        if (shouldBreak("boolean" === typeof data.value && value.value === data.value)) {
          match = !match;
          break;
        }
      } else if ("null" === value.type) {
        // ignore value.value
        if (shouldBreak(null === data.value)) {
          match = !match;
          break;
        }
      } else if ("undefined" === value.type) {
        // ignore value.value
        if (shouldBreak(undefined === data.value)) {
          match = !match;
          break;
        }
      } else {
        if (shouldBreak(value.value === data.value)) {
          match = !match;
          break;
        }
      }
    }

    return match;
  }

  function getIfResult(context, option) {
    if (!Array.isArray(context.if)) {
      return true;
    }

    const isOr = "or" === context.logic;

    if (isOr) {
      for (const config of context.if) {
        if (conditionPasses(config, option)) {
          return true;
        }
      }
      return false;
    }

    for (const config of context.if) {
      if (!conditionPasses(config, option)) {
        return false;
      }
    }
    return true;
  }

  function conditionPasses(config, option) {
    const { path, values } = config || {};
    const data = visit(option.documentVerbose, ...toPath(path));

    if (undefined === data?.value) {
      return false;
    }

    if ("string" === typeof path && Array.isArray(values) && noneEmpty(path, values)) {
      return isMatch(data, values);
    }

    return true;
  }

  function extendFor(context) {
    const extended = [];

    if (!Array.isArray(context.for)) {
      return extended;
    }

    extended.push(context);

    for (const config of context.for) {
      const { replace, start, end, step } = config || {};

      // step > 0 guards against infinite loops: step===0 means j never advances,
      // and step<0 with end>start means j moves away from end, both hang forever.
      if (
        "string" === typeof replace &&
        "number" === typeof start &&
        "number" === typeof end &&
        "number" === typeof step &&
        noneEmpty(replace) &&
        end > start &&
        step > 0
      ) {
        for (let i = extended.length; i > 0; --i) {
          const context = extended.shift();

          for (let j = start; j < end; j += step) {
            extended.push(
              Object.assign({}, context, {
                path: context.path.replace(replace, String(j)),
              })
            );
          }
        }
      }
    }

    return extended;
  }

  return function (context) {
    const fileContexts = [];
    const checkList = [];

    for (const contextOptionList of context.options) {
      for (const contextOption of contextOptionList) {
        const { file, path, values } = contextOption;

        if (
          "string" === typeof file &&
          "string" === typeof path &&
          Array.isArray(values) &&
          noneEmpty(file, path, values)
        ) {
          fileContexts.push(contextOption);
        }
      }
    }

    for (const context of fileContexts) {
      for (const option of options) {
        if (!getIfResult(context, option)) {
          break;
        }

        const extended = [...extendFor(context)];

        if (allEmpty(extended)) {
          extended.push(context);
        }

        for (const item of extended) {
          if (new RegExp(item.file).test(option.file)) {
            checkList.push(Object.assign({}, item, option));
          }
        }
      }
    }

    for (const item of checkList) {
      const data = visit(item.documentVerbose, ...toPath(item.path));

      if (undefined === data?.value) {
        context.report({
          messageId: "pathNotExists",
          data: { path: item.path },
          loc: {
            start: {
              line: data?.position?.startLine,
              column: data?.position?.startColumn,
            },
            end: {
              line: data?.position?.endLine,
              column: data?.position?.endColumn,
            },
          },
        });
      } else {
        if (!isMatch(data, item.values, false)) {
          context.report({
            messageId: "valueNotMatch",
            data: {
              path: item.path,
              values: `[ ${item.values.map((o) => String(o.value)).join(" , ")} ]`,
            },
            loc: {
              start: {
                line: data?.position?.startLine,
                column: data?.position?.startColumn,
              },
              end: {
                line: data?.position?.endLine,
                column: data?.position?.endColumn,
              },
            },
          });
        }
      }
    }

    return {};
  };
};
