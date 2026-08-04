/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

function create() {
  return {
    plugins: ["check-json-value"],
    env: {
      browser: true,
      node: true,
    },
    rules: {
      "check-json-value/json-lint": [
        "error",
        {
          lint: true,
        },
      ],
    },
  };
}

module.exports = {
  create,
};
