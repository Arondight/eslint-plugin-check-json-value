/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

module.exports = {
  type: "suggestion",
  messages: {
    errorMessage: "{{ message }}",
  },
  schema: [
    {
      type: "object",
      properties: {
        lint: { type: "boolean" },
      },
      additionalProperties: false,
    },
  ],
  fixable: "code",
};
