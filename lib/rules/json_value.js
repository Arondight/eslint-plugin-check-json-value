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
        if (
          "string" === typeof contextOption.file &&
          "string" === typeof contextOption.path &&
          Array.isArray(contextOption.values) &&
          "" !== contextOption.file &&
          "" !== contextOption.path &&
          contextOption.values.length > 0
        ) {
          fileContexts.push(contextOption);
        }
      }
    }

    for (const context of fileContexts) {
      for (const option of options) {
        if (new RegExp(context.file).test(option.file)) {
          checkList.push(Object.assign({}, context, option));
        }
      }
    }

    for (const check of checkList) {
      const data = lodash.get(check.document, check.path);

      if (undefined === data) {
        context.report({
          ruleId: "check-json-value/json-value",
          message: `path "${check.path}" is not exists`,
          loc: { start: 0, end: 0 }, // FIXME how to find out location
        });
      } else {
        for (const regstr of check.values) {
          if (!new RegExp(regstr).test(data.toString())) {
            pass = false;
            error = lodash.pick(check, ["path", "values"]);
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
