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

    it("should get nothing with valid JSON file", () => assert.deepEqual(expect, result[0].messages));
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

    it("should get error with invalid JSON file", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("strict JSON mode (comments)", () => {
    const strictConfig = path.resolve(rulesDir, "test_json_lint_strict_eslintrc.json");
    const strictDisabledConfig = path.resolve(rulesDir, "test_json_lint_strict_disabled_eslintrc.json");
    const commentFile = path.resolve(rulesDir, "test_json_lint_comment.json");
    const jsoncFile = path.resolve(rulesDir, "test_json_lint_jsonc.jsonc");

    describe("should flag comments in .json files (strict default)", () => {
      const result = runner(strictConfig, commentFile);
      const expect = [
        {
          ruleId: "check-json-value/json-lint",
          severity: 2,
          message: "Comments are not allowed in strict JSON (rename to .jsonc or set strict: false)",
          line: 2,
          column: 3,
          messageId: "errorMessage",
          endLine: 2,
          endColumn: 28,
        },
      ];

      it("should get comment errors in .json file", () => assert.deepEqual(expect, result[0].messages));
    });

    describe("should not flag comments when strict: false", () => {
      const result = runner(strictDisabledConfig, commentFile);

      it("should get nothing with strict disabled", () => assert.deepEqual([], result[0].messages));
    });

    describe("should not flag comments in .jsonc files", () => {
      const result = runner(strictConfig, jsoncFile);

      it("should get nothing with .jsonc file", () => assert.deepEqual([], result[0].messages));
    });
  });
});
