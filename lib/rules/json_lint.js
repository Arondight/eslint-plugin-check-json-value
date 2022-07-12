/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

function factory(options) {
  return function (context) {
    const fileContexts = [];
    const checkList = [];

    for (const option of context.options) {
      if (true === option.lint) {
        fileContexts.push(option);
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
      if (
        Array.isArray(check.documentRich.syntaxErrors) &&
        check.documentRich.syntaxErrors.length > 0
      ) {
        for (const error of check.documentRich.syntaxErrors) {
          context.report({
            ruleId: "check-json-value/json-lint",
            message: error.message,
            loc: {
              start: {
                line: error.range.start.line + 1,
                column: error.range.start.character,
              },
              end: {
                line: error.range.end.line + 1,
                column: error.range.end.character,
              },
            },
          });
        }
      }
    }

    return {};
  };
}

module.exports = {
  meta: {
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: {
          lint: true,
        },
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
