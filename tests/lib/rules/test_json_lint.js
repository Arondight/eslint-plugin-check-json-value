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
        ruleId: "check-json-value/json-lint",
        severity: 2,
        message: "Property keys must be doublequoted",
        line: 2,
        column: 3,
        nodeType: null,
        endLine: 2,
        endColumn: 5,
      },
      {
        ruleId: "check-json-value/json-lint",
        severity: 2,
        message: "Trailing comma",
        line: 3,
        column: 21,
        nodeType: null,
        endLine: 3,
        endColumn: 22,
      },
    ];

    it("should get error with invalid JSON file", () =>
      assert.deepEqual(expect, result[0].messages));
  });
});
