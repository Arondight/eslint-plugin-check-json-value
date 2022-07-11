/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

function create() {
  return {
    plugins: ["json-lint"],
    env: ["browser", "node"],
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
