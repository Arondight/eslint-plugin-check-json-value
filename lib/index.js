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
const { version } = require("../package.json");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------
// { file: string, document: array_of_string, documentRich: array_of_object }
const options = [];

const jsonProcessor = JSONProcessor.create(options);

const plugin = {
  meta: {
    name: "eslint-plugin-check-json-value",
    version,
  },
  configs: {
    // legacy config (ESLint 8 and below)
    recommended: recommendedConfig.create(),
  },
  rules: {
    "json-lint": JSONLintRule.create(options),
    "json-value": JSONValueRule.create(options),
  },
  processors: {
    // ".json" for ESLint 8 auto-application by file extension;
    // "json" is a valid identifier for ESLint 9+ flat config string reference.
    // ".jsonc" / "jsonc" extend the same processor to JSONC files.
    ".json": jsonProcessor,
    ".jsonc": jsonProcessor,
    json: jsonProcessor,
    jsonc: jsonProcessor,
  },
};

// flat config (ESLint 9+); assign after creation so we can self-reference `plugin`
plugin.configs["flat/recommended"] = [
  {
    plugins: { "check-json-value": plugin },
    rules: {
      "check-json-value/json-lint": ["error", { lint: true }],
    },
  },
  {
    files: ["**/*.{json,jsonc}"],
    processor: "check-json-value/json",
  },
];

module.exports = plugin;
