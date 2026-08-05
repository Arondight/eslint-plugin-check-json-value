const assert = require("assert");
const runner = require("../../runner.js");
const path = require("path");

describe("json-value", () => {
  const testDir = path.dirname(require.resolve("../../runner.js"));
  const rulesDir = path.resolve(testDir, "lib", "rules");
  const json = path.resolve(rulesDir, "test_json_value.json");
  const expectError = [
    {
      ruleId: "check-json-value/json-value",
      severity: 2,
      message: `path "data.records[0].id" doesn't match any of [ 99999 ]`,
      line: 7,
      column: 16,
      messageId: "valueNotMatch",
      endLine: 7,
      endColumn: 21,
    },
  ];

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
        line: null,
        column: null,
        messageId: "pathNotExists",
        endLine: null,
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
        line: null,
        column: null,
        messageId: "pathNotExists",
        endLine: null,
        endColumn: null,
      },
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[1].values[1]" is not exists',
        line: null,
        column: null,
        messageId: "pathNotExists",
        endLine: null,
        endColumn: null,
      },
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[1].values[2]" is not exists',
        line: null,
        column: null,
        messageId: "pathNotExists",
        endLine: null,
        endColumn: null,
      },
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[2].values[0]" doesn\'t match any of [ ^\\d+$ ]',
        line: 16,
        column: 21,
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
        messageId: "valueNotMatch",
        endLine: 16,
        endColumn: 34,
      },
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[2].values[2]" is not exists',
        line: null,
        column: null,
        messageId: "pathNotExists",
        endLine: null,
        endColumn: null,
      },
    ];

    it("should get error when not match valid value with for", () => assert.deepEqual(expect, result[0].messages));
  });

  describe("step guard: step===0 must not hang", () => {
    const config = path.resolve(rulesDir, "test_json_value_step_guard_eslintrc.json");
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: 'path "data.records[{{X}}].id" is not exists',
        line: null,
        column: null,
        messageId: "pathNotExists",
        endLine: null,
        endColumn: null,
      },
    ];

    it("should skip expansion and report the unreplaced placeholder path", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("invalid regex must surface a clear error, not a raw crash", () => {
    const config = path.resolve(rulesDir, "test_json_value_invalid_regex_eslintrc.json");

    it("should throw with an 'invalid regex' message", () =>
      assert.throws(() => runner(config, json), /invalid regex/));
  });

  describe('logic "or": one condition matches, one doesn\'t', () => {
    const config = path.resolve(rulesDir, "test_json_value_if_or_pass_eslintrc.json");
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: `path "data.records[0].id" doesn't match any of [ 99999 ]`,
        line: 7,
        column: 16,
        messageId: "valueNotMatch",
        endLine: 7,
        endColumn: 21,
      },
    ];

    it("should run the check (OR satisfied) and report valueNotMatch", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe('logic "or": no conditions match', () => {
    const config = path.resolve(rulesDir, "test_json_value_if_or_fail_eslintrc.json");
    const result = runner(config, json);
    const expect = [];

    it("should skip the check (OR not satisfied) and get nothing", () => assert.deepEqual(expect, result[0].messages));
  });

  describe('logic "or": one path missing, another matches', () => {
    const config = path.resolve(rulesDir, "test_json_value_if_or_missing_path_eslintrc.json");
    const result = runner(config, json);
    const expect = [
      {
        ruleId: "check-json-value/json-value",
        severity: 2,
        message: `path "data.records[0].id" doesn't match any of [ 99999 ]`,
        line: 7,
        column: 16,
        messageId: "valueNotMatch",
        endLine: 7,
        endColumn: 21,
      },
    ];

    it("should run the check (OR satisfied by the existing path) and report valueNotMatch", () =>
      assert.deepEqual(expect, result[0].messages));
  });

  describe("inline logic tokens (new if format)", () => {
    describe("inline OR (no blocks) — check runs when one condition passes", () => {
      const config = path.resolve(rulesDir, "test_json_value_if_inline_or_pass_eslintrc.json");
      const result = runner(config, json);
      it("should run the check and report valueNotMatch", () => assert.deepEqual(expectError, result[0].messages));
    });

    describe("block grouping: (A AND B) OR C — true when A fails but C passes", () => {
      // A=name^dog$ (false), B=age==100 (true), C=id==10000 (true): (false AND true) OR true = true
      const config = path.resolve(rulesDir, "test_json_value_if_block_and_or_eslintrc.json");
      const result = runner(config, json);
      it("should run the check and report valueNotMatch", () => assert.deepEqual(expectError, result[0].messages));
    });

    describe("block grouping: A AND (B OR C) — false when A fails despite B,C passing", () => {
      // Same A,B,C, different grouping: false AND (true OR true) = false
      const config = path.resolve(rulesDir, "test_json_value_if_block_or_and_eslintrc.json");
      const result = runner(config, json);
      it("should skip the check (AND not satisfied) and get nothing", () => assert.deepEqual([], result[0].messages));
    });
  });

  describe("if backward compat (old format with logic field)", () => {
    describe("explicit logic:and with both conditions true", () => {
      // A=name^Mr.Cat$ (true), C=age==100 (true): true AND true → check runs
      const config = path.resolve(rulesDir, "test_json_value_if_compat_and_true_eslintrc.json");
      const result = runner(config, json);
      it("should run the check and report valueNotMatch", () => assert.deepEqual(expectError, result[0].messages));
    });

    describe("explicit logic:and with one condition false", () => {
      // A=true, B=name^dog$ (false): true AND false → check skipped
      const config = path.resolve(rulesDir, "test_json_value_if_compat_and_false_eslintrc.json");
      const result = runner(config, json);
      it("should skip the check and get nothing", () => assert.deepEqual([], result[0].messages));
    });
  });

  describe("old-vs-new format equivalence", () => {
    describe("new [B, {logic:or}, C] produces same result as old [B, C] + logic:or", () => {
      // B=false, C=true: old format gives OR-satisfied (existing if_or_pass); new format should match
      const config = path.resolve(rulesDir, "test_json_value_if_compat_equiv_or_eslintrc.json");
      const result = runner(config, json);
      it("should run the check and report valueNotMatch (same as old format)", () =>
        assert.deepEqual(expectError, result[0].messages));
    });
  });

  describe("complex nested logic (block grouping)", () => {
    // A=name^Mr.Cat$ (true) B=name^dog$ (false) C=age==100 (true) D=age==99999 (false) E=id==10000 (true) F=records[1].id null (true)

    describe("((B AND C) OR (D AND E)) AND A → false → skip", () => {
      // (false∧true) ∨ (false∧true) = false; false ∧ true = false
      const config = path.resolve(rulesDir, "test_json_value_if_nested_1_eslintrc.json");
      const result = runner(config, json);
      it("should skip the check and get nothing", () => assert.deepEqual([], result[0].messages));
    });

    describe("A OR (B AND (C OR D)) → true → check runs", () => {
      // C∨D=true; B∧true=false; A∨false=true
      const config = path.resolve(rulesDir, "test_json_value_if_nested_2_eslintrc.json");
      const result = runner(config, json);
      it("should run the check and report valueNotMatch", () => assert.deepEqual(expectError, result[0].messages));
    });

    describe("(A AND B) OR (C AND D) OR (E AND F) → true (third pair) → check runs", () => {
      // (true∧false)=false ∨ (true∧false)=false ∨ (true∧true)=true → true
      const config = path.resolve(rulesDir, "test_json_value_if_nested_3_eslintrc.json");
      const result = runner(config, json);
      it("should run the check and report valueNotMatch", () => assert.deepEqual(expectError, result[0].messages));
    });

    describe("A AND (B OR (C AND (D OR E))) → true → check runs (3-level nesting)", () => {
      // D∨E=true; C∧true=true; B∨true=true; A∧true=true
      const config = path.resolve(rulesDir, "test_json_value_if_nested_4_eslintrc.json");
      const result = runner(config, json);
      it("should run the check and report valueNotMatch", () => assert.deepEqual(expectError, result[0].messages));
    });
  });

  describe("implicit AND (adjacent conditions without operator)", () => {
    describe("[A, {logic:and}, C, B] — B has no operator, implicit AND → false → skip", () => {
      // A=true, {and}, C=true, then B (no operator) → implicit AND: true ∧ true ∧ false = false
      const config = path.resolve(rulesDir, "test_json_value_if_implicit_and_eslintrc.json");
      const result = runner(config, json);
      it("should skip the check and get nothing", () => assert.deepEqual([], result[0].messages));
    });
  });
});
