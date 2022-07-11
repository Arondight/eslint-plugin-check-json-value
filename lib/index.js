/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const recommendedConfig = require("./configs/recommended.js");
const JSONProcessor = require("./processors/json.js");
const JSONLintRule = require("./rules/json_lint.js");
const JSONValueRule = require("./rules/json_value.js");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------
// { file: string, document: array_of_string, documentRich: array_of_object }
const options = [];

module.exports = {
  configs: {
    recommended: recommendedConfig.create(),
  },
  rules: {
    "json-lint": JSONLintRule.create(options),
    "json-value": JSONValueRule.create(options),
  },
  processors: {
    ".json": JSONProcessor.create(options),
  },
};
