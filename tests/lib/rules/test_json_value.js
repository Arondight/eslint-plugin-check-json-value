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

    it("should get nothing with empty value", () => {
      assert.deepEqual(expect, result[0].messages);
    });
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

    it("should get error if path not exists", () => {
      assert.deepEqual(expect, result[0].messages);
    });
  });

  describe("match valid value", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_valid_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [];

    it("should get nothing with valid value", () => {
      assert.deepEqual(expect, result[0].messages);
    });
  });

  describe("match invalid value", () => {
    const config = path.resolve(
      rulesDir,
      "test_json_value_invalid_eslintrc.json"
    );
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message:
          'path "data.records[3].id" doesn\'t match any of "miss matched"',
        column: null,
        nodeType: null,
      },
    ];

    it("should get error with invalid value", () => {
      assert.deepEqual(expect, result[0].messages);
    });
  });

  describe("match null value", () => {
    const config = path.resolve(rulesDir, "test_json_value_null_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing with null value", () => {
      assert.deepEqual(expect, result[0].messages);
    });
  });
});
