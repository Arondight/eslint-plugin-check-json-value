/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

const lodash = require("lodash");

function factory(options) {
  return function (context) {
    const fileContexts = [];
    const checkList = [];
    let pass = true;
    let error = {};

    for (const contextOptionList of context.options) {
      for (const contextOption of contextOptionList) {
        const { file, path, values } = contextOption;

        if (
          "string" === typeof file &&
          "" !== file &&
          "string" === typeof path &&
          "" !== path &&
          Array.isArray(values) &&
          values.length > 0
        ) {
          fileContexts.push(contextOption);
        }
      }
    }

    for (const context of fileContexts) {
      for (const option of options) {
        let check = true;

        if (Array.isArray(context.if)) {
          for (const condition of context.if) {
            const { path, values } = condition;
            const data = lodash.get(option.document, path);

            if (undefined === data) {
              check = false;
              break;
            }

            if (
              "string" === typeof path &&
              path.length > 0 &&
              Array.isArray(values) &&
              values.length > 0
            ) {
              let match = false;

              for (const regstr of values) {
                if (new RegExp(regstr).test(new String(data))) {
                  match = true;
                  break;
                }
              }

              if (false === match) {
                check = false;
                break;
              }
            }
          }
        }

        if (true === check && new RegExp(context.file).test(option.file)) {
          checkList.push(Object.assign({}, context, option));
        }
      }
    }

    for (const item of checkList) {
      const data = lodash.get(item.document, item.path);

      if (undefined === data) {
        context.report({
          ruleId: "check-json-value/json-value",
          message: `path "${item.path}" is not exists`,
          loc: { start: 0, end: 0 }, // FIXME how to find out location
        });
      } else {
        for (const regstr of item.values) {
          if (!new RegExp(regstr).test(new String(data))) {
            pass = false;
            error = lodash.pick(item, ["path", "values"]);
            break;
          }
        }
      }
    }

    if (false === pass) {
      context.report({
        ruleId: "check-json-value/json-value",
        message: `path "${
          error.path
        }" doesn't match any of "${error.values.join('", "')}"`,
        loc: { start: 0, end: 0 }, // FIXME how to find out location
      });
    }

    return {};
  };
}

module.exports = {
  meta: {
    type: "suggestion",
    schema: [
      {
        type: "array",
        properties: [
          {
            file: { type: "string" },
            path: { type: "string" },
            values: { type: "array" },
            if: {
              type: "array",
              properties: [
                {
                  path: { type: "string" },
                  values: { type: "array" },
                },
              ],
            },
          },
        ],
        additionalProperties: false,
      },
    ],
    fixable: "code",
  },

  create(options) {
    return {
      meta: this.meta,
      create: factory(options),
    };
  },
};
