/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

module.exports = {
  type: "suggestion",
  docs: {
    description: "lint JSON file",
    category: "Possible Problems",
    recommended: true,
    url: "https://github.com/Arondight/eslint-plugin-check-json-value/blob/master/lib/rules/meta/json_lint.js",
  },
  messages: {
    errorMessage: "{{ message }}",
  },
  schema: [
    {
      type: "object",
      properties: {
        lint: { type: "boolean" },
        strict: { type: "boolean" },
      },
      additionalProperties: false,
    },
  ],
};
