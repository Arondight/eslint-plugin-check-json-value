/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

const { allEmpty, noneEmpty } = require("../../../utils/empty.js");
const { visit } = require("../../../utils/json_ast.js");
const stringToPath = require("lodash/_stringToPath.js");

module.exports = function (options) {
  function isMatch(data, values) {
    let match = true;

    for (const value of values) {
      if ("string" === value.type) {
        const reg = new RegExp(
          value.value,
          true == value.ignoreCase ? "i" : undefined
        );

        if ("string" !== typeof data.value || !reg.test(data.value)) {
          match = false;
          break;
        }
      } else if ("number" === value.type) {
        if ("number" !== typeof data.value) {
          match = false;
          break;
        } else if ("string" === typeof value.value) {
          const reg = new RegExp(
            value.value,
            true == value.ignoreCase ? "i" : undefined
          );

          if (!reg.test(String(data.value))) {
            match = false;
            break;
          }
        } else if (value.value !== data.value) {
          match = false;
          break;
        }
      } else if ("boolean" === value.type) {
        if ("boolean" !== typeof data.value || value.value !== data.value) {
          match = false;
          break;
        }
      } else if ("null" === value.type) {
        // ignore value.value
        if (null !== data.value) {
          match = false;
          break;
        }
      } else if ("undefined" === value.type) {
        // ignore value.value
        if (undefined !== data.value) {
          match = false;
          break;
        }
      } else {
        if (value.value !== data.value) {
          match = false;
          break;
        }
      }
    }

    return match;
  }

  function getIfResult(context, option) {
    let result = true;

    if (!Array.isArray(context.if)) {
      return result;
    }

    for (const config of context.if) {
      const { path, values } = config || {};
      const data = visit(option.documentVerbose, ...stringToPath(path));

      if (undefined === data?.value) {
        result = false;
        break;
      }

      if (
        "string" === typeof path &&
        Array.isArray(values) &&
        noneEmpty(path, values)
      ) {
        if (!isMatch(data, values)) {
          result = false;
          break;
        }
      }
    }

    return result;
  }

  function extendFor(context) {
    const extended = [];

    if (!Array.isArray(context.for)) {
      return extended;
    }

    extended.push(context);

    for (const config of context.for) {
      const { replace, start, end, step } = config || {};

      if (
        "string" === typeof replace &&
        "number" === typeof start &&
        "number" === typeof end &&
        "number" === typeof step &&
        noneEmpty(replace) &&
        end > start
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
      const data = visit(item.documentVerbose, ...stringToPath(item.path));

      if (undefined === data?.value) {
        context.report({
          ruleId: "check-json-value/json-value",
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
        if (!isMatch(data, item.values)) {
          context.report({
            ruleId: "check-json-value/json-value",
            messageId: "valueNotMatch",
            data: {
              path: item.path,
              values: `[ ${item.values
                .map((o) => String(o.value))
                .join(" , ")} ]`,
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
