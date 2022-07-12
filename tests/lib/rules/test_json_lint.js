const assert = require("assert");
const runner = require("../../runner.js");
const path = require("path");

describe("json-lint", function () {
  const testDir = path.dirname(require.resolve("../../runner.js"));
  const rulesDir = path.resolve(testDir, "lib", "rules");
  const config = path.resolve(rulesDir, "test_json_lint_eslintrc.json");

  describe("lint valid JSON file", () => {
    const json = path.resolve(rulesDir, "test_json_lint_valid.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing with valid JSON file", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("lint invalid JSON file", () => {
    const json = path.resolve(rulesDir, "test_json_lint_invalid.json");
    const result = runner(config, json);
    const expect = [
      {
        column: 3,
        endColumn: 5,
        endLine: 2,
        line: 2,
        message: "Property keys must be doublequoted",
        messageId: "errorMessage",
        nodeType: null,
        ruleId: "check-json-value/json-lint",
        severity: 2,
      },
      {
        column: 21,
        endColumn: 22,
        endLine: 3,
        line: 3,
        message: "Trailing comma",
        messageId: "errorMessage",
        nodeType: null,
        ruleId: "check-json-value/json-lint",
        severity: 2,
      },
    ];

    it("should get error with invalid JSON file", () =>
      assert.deepEqual(expect, result[0].messages));
  });
});
