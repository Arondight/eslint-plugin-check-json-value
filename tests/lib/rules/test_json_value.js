const assert = require("assert");
const runner = require("../../runner.js");
const path = require("path");

describe("json-value", () => {
  const testDir = path.dirname(require.resolve("../../runner.js"));
  const rulesDir = path.resolve(testDir, "lib", "rules");
  const json = path.resolve(rulesDir, "test_json_value.json");

  describe("match empty value", () => {
    const config = path.resolve(rulesDir, "test_json_value_empty_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing when match empty value", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("path not exists", () => {
    const config = path.resolve(rulesDir, "test_json_value_not_exists_eslintrc.json");
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "that.is.a.great.day" is not exists',
        column: null,
        nodeType: null,
        messageId: "pathNotExists",
        endColumn: null,
      },
    ];

    it("should get error when path not exists", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("match valid value", () => {
    const config = path.resolve(rulesDir, "test_json_value_valid_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing when match valid value", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("not match valid value", () => {
    const config = path.resolve(rulesDir, "test_json_value_invalid_eslintrc.json");
    const result = runner(config, json);
    const expect = [
      {
        column: 16,
        endColumn: 23,
        endLine: 19,
        line: 19,
        message: `path "data.records[3].id" doesn't match any of [ 0 , 99999 ]`,
        messageId: "valueNotMatch",
        nodeType: null,
        ruleId: "check-json-value/json-value",
        severity: 2,
      },
    ];

    it("should get error when not match valid value", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("match null value", () => {
    const config = path.resolve(rulesDir, "test_json_value_null_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing when match null value", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("match value with a true condition", () => {
    const config = path.resolve(rulesDir, "test_json_value_valid_if_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing when match value with a true condition", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("match value with a false condition", () => {
    const config = path.resolve(rulesDir, "test_json_value_valid_if_not_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing with a false condition", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("not match value with a true condition", () => {
    const config = path.resolve(rulesDir, "test_json_value_invalid_if_eslintrc.json");
    const result = runner(config, json);
    const expect = [
      {
        column: 16,
        endColumn: 21,
        endLine: 7,
        line: 7,
        message: `path "data.records[0].id" doesn't match any of [ 99999 ]`,
        messageId: "valueNotMatch",
        nodeType: null,
        ruleId: "check-json-value/json-value",
        severity: 2,
      },
    ];

    it("should get error when not match with a true condition", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("not match value with a false condition", () => {
    const config = path.resolve(rulesDir, "test_json_value_invalid_if_not_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing with a false condition", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("not match value with true conditions", () => {
    const config = path.resolve(rulesDir, "test_json_value_invalid_if_conditions_true_eslintrc.json");
    const result = runner(config, json);
    const expect = [
      {
        column: 16,
        endColumn: 21,
        endLine: 7,
        line: 7,
        message: `path "data.records[0].id" doesn't match any of [ 99999 ]`,
        messageId: "valueNotMatch",
        nodeType: null,
        ruleId: "check-json-value/json-value",
        severity: 2,
      },
    ];

    it("should get error when not match with true conditions", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("not match value with false conditions", () => {
    const config = path.resolve(rulesDir, "test_json_value_invalid_if_conditions_false_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing with false conditions", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("not match valid value with for", () => {
    const config = path.resolve(rulesDir, "test_json_value_invalid_for_eslintrc.json");
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[1].values[0]" is not exists',
        column: null,
        nodeType: null,
        messageId: "pathNotExists",
        endColumn: null,
      },
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[1].values[1]" is not exists',
        column: null,
        nodeType: null,
        messageId: "pathNotExists",
        endColumn: null,
      },
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[1].values[2]" is not exists',
        column: null,
        nodeType: null,
        messageId: "pathNotExists",
        endColumn: null,
      },
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[2].values[0]" doesn\'t match any of [ ^\\d+$ ]',
        line: 16,
        column: 21,
        nodeType: null,
        messageId: "valueNotMatch",
        endLine: 16,
        endColumn: 25,
      },
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[2].values[1]" doesn\'t match any of [ ^\\d+$ ]',
        line: 16,
        column: 27,
        nodeType: null,
        messageId: "valueNotMatch",
        endLine: 16,
        endColumn: 34,
      },
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[2].values[2]" is not exists',
        column: null,
        nodeType: null,
        messageId: "pathNotExists",
        endColumn: null,
      },
    ];

    it("should get error when not match valid value with for", () => assert.deepEqual(expect, result[0].messages));
  });
});
