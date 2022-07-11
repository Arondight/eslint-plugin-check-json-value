const assert = require("assert");
const runner = require("../../runner.js");
const path = require("path");

describe("json-value", () => {
  const testDir = path.dirname(require.resolve("../../runner.js"));
  const rulesDir = path.resolve(testDir, "lib", "rules");
  const json = path.resolve(rulesDir, "test_json_value.json");

  describe("match empty value", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_empty_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [];

    it("should get nothing when match empty value", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("path not exists", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_not_exists_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "not exists" is not exists',
        column: null,
        nodeType: null,
      },
    ];

    it("should get error when path not exists", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("match valid value", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_valid_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [];

    it("should get nothing when match valid value", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("not match valid value", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_invalid_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[3].id" doesn\'t match any of "not match"',
        column: null,
        nodeType: null,
      },
    ];

    it("should get error when not match valid value", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("match null value", () => {
    const config = path.resolve(rulesDir, "test_json_value_null_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing when match null value", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("match value with a true condition", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_valid_if_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [];

    it("should get nothing when match value with a true condition", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("match value with a false condition", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_valid_if_not_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [];

    it("should get nothing with a false condition", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("not match value with a true condition", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_invalid_if_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[0].id" doesn\'t match any of "not match"',
        column: null,
        nodeType: null,
      },
    ];

    it("should get error when not match with a false condition", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("not match value with a false condition", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_invalid_if_not_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [];

    it("should get nothing with a false condition", () =>
      assert.deepEqual(expect, result[0].messages));
  });
});
