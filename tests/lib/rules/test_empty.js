const assert = require("assert");
const { allEmpty, anyEmpty, noneEmpty } = require("../../../lib/utils/empty.js");

describe("empty utils", () => {
  describe("isEmpty(null) must not throw", () => {
    it("should treat null as empty via anyEmpty", () => assert.equal(true, anyEmpty(null)));
    it("should treat null as empty via allEmpty", () => assert.equal(true, allEmpty(null)));
    it("should treat null as empty by noneEmpty returning false", () => assert.equal(false, noneEmpty(null)));
  });

  describe("non-empty values are not empty", () => {
    it("should not treat a non-empty string as empty", () => assert.equal(false, anyEmpty("x")));
    it("should not treat a non-empty array as empty", () => assert.equal(false, anyEmpty([1])));
    it("should not treat a non-empty object as empty", () => assert.equal(false, anyEmpty({ a: 1 })));
  });

  describe("empty values are empty", () => {
    it("should treat an empty string as empty", () => assert.equal(true, anyEmpty("")));
    it("should treat an empty array as empty", () => assert.equal(true, anyEmpty([])));
    it("should treat an empty object as empty", () => assert.equal(true, anyEmpty({})));
  });
});
