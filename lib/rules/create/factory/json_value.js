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

    // New format: inline operators/block markers in the array (detected by
    // `logic`/`block` string props). Old format: all conditions, use `logic` field.
    const isNewFormat = context.if.some((el) => el && (typeof el.logic === "string" || typeof el.block === "string"));

    if (isNewFormat) {
      return evalIfExpression(buildAST(context.if), option);
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

  // Fold flat token stream into nested AST via block start/end. Unclosed
  // blocks tolerated (extra stack entries are harmless).
  function buildAST(tokens) {
    const stack = [[]];
    for (const token of tokens) {
      if (token.block === "start") {
        const group = [];
        stack[stack.length - 1].push(group);
        stack.push(group);
      } else if (token.block === "end") {
        if (stack.length > 1) stack.pop();
      } else {
        stack[stack.length - 1].push(token);
      }
    }
    return stack[0];
  }

  // Left-to-right evaluation with short-circuit. Sub-arrays recurse via
  // evalCondition. Adjacent conditions without an operator = implicit AND.
  function evalIfExpression(elements, option) {
    if (!Array.isArray(elements) || elements.length === 0) return true;

    let result = evalCondition(elements[0], option);

    for (let i = 1; i < elements.length; i++) {
      const el = elements[i];

      if (el && typeof el.logic === "string") {
        i++;
        if (i >= elements.length) break;

        if (el.logic === "and") {
          if (!result) continue;
          result = evalCondition(elements[i], option);
        } else {
          if (result) continue;
          result = evalCondition(elements[i], option);
        }
      } else {
        if (!result) continue;
        result = evalCondition(el, option);
      }
    }

    return result;
  }

  function evalCondition(element, option) {
    if (Array.isArray(element)) {
      return evalIfExpression(element, option);
    }
    if (element && (typeof element.logic === "string" || typeof element.block === "string")) {
      // misplaced operator/block marker — treat as no-op (true) for robustness
      return true;
    }
    return conditionPasses(element, option);
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
