const assert = require("assert");
const runner = require("../../runner.js");
const path = require("path");

describe("recommended config", () => {
  const testDir = path.dirname(require.resolve("../../runner.js"));
  const rulesDir = path.resolve(testDir, "lib", "rules");
  const config = path.resolve(rulesDir, "test_recommended_eslintrc.json");

  describe("loads via extends and lints invalid JSON", () => {
    const json = path.resolve(rulesDir, "test_json_lint_invalid.json");
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-lint",
        severity: 2,
        message: "Property keys must be doublequoted",
        line: 2,
        column: 3,
        messageId: "errorMessage",
        endLine: 2,
        endColumn: 5,
      },
      {
        ruleId: "check-json-value/json-lint",
        severity: 2,
        message: "Trailing comma",
        line: 3,
        column: 21,
        messageId: "errorMessage",
        endLine: 3,
        endColumn: 22,
      },
    ];

    it("should get json-lint errors via the recommended config", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("loads via extends and lints valid JSON", () => {
    const json = path.resolve(rulesDir, "test_json_lint_valid.json");
    const result = runner(config, json);
    const expect = [];

    it("should get nothing with valid JSON via the recommended config", () =>
      assert.deepEqual(expect, result[0].messages));
  });
});
