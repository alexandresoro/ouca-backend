import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import {
  areSetsContainingSameValues,
  getFormattedDate,
  getFormattedTime,
  isIdInListIds,
  isTimeValid,
} from "./utils.js";

describe("Method that checks that sets are containing same value", () => {
  test("should validate same values on same object", () => {
    const set = new Set(["bob", 3, true]);

    assert.ok(areSetsContainingSameValues(set, set));
  });

  test("should validate same values on same contained values", () => {
    const set1 = new Set(["bob", 3, true]);
    const set2 = new Set([true, 3, "bob", 3, "bob"]);

    assert.ok(areSetsContainingSameValues(set1, set2));
  });

  test("should validate different values on different size", () => {
    const set1 = new Set(["bob", 3, true]);
    const set2 = new Set([true, 3, "bob", 3, "bob", false]);

    assert.strictEqual(areSetsContainingSameValues(set1, set2), false);
  });

  test("should validate different values on different values", () => {
    const set1 = new Set(["bob", 3, true]);
    const set2 = new Set([false, 3, "bob", 3, "bob"]);

    assert.strictEqual(areSetsContainingSameValues(set1, set2), false);
  });
});

describe("Method that checks if id is in list", () => {
  test("should find id in list", () => {
    const set = new Set([3, 7, 2.5, 12]);

    assert.ok(isIdInListIds(set, 12));
  });

  test("should not find id in empty list", () => {
    const set = new Set([]);

    assert.strictEqual(isIdInListIds(set, 12), false);
  });
});

describe("Date formatter", () => {
  test("should parse a correctly formatted date", () => {
    assert.deepStrictEqual(getFormattedDate("26/02/2022"), new Date(2022, 1, 26));
  });

  test("should avoid to parse a valid but ambiguous date", () => {
    assert.strictEqual(getFormattedDate("26/02/22"), null);
  });

  test("should avoid to parse a date that does not respect the expected format", () => {
    assert.strictEqual(getFormattedDate("26-02-2022"), null);
  });

  test("should avoid to handle a non parseable date", () => {
    assert.strictEqual(getFormattedDate("bob"), null);
  });

  test("should format a correct time", () => {
    assert.strictEqual(getFormattedTime("11:18"), "11:18");
  });

  test("should format alternative formats for correct time", () => {
    assert.strictEqual(getFormattedTime("1118"), "11:18");
    assert.strictEqual(getFormattedTime("11h18"), "11:18");
    assert.strictEqual(getFormattedTime("11H18"), "11:18");
    assert.strictEqual(getFormattedTime("0338"), "03:38");
  });
});

describe("Time validator", () => {
  test("should validate correct formats for time", () => {
    assert.ok(isTimeValid("11:18"));
    assert.ok(isTimeValid("1118"));
    assert.ok(isTimeValid("11h18"));
    assert.ok(isTimeValid("11H18"));
    assert.ok(isTimeValid("03:38"));
  });

  test("should return null when incorrect format of time", () => {
    assert.strictEqual(getFormattedTime("11:78"), null);
    assert.strictEqual(getFormattedTime("118"), null);
    assert.strictEqual(getFormattedTime("11u18"), null);
    assert.strictEqual(getFormattedTime("-11H18"), null);
    assert.strictEqual(getFormattedTime("3:38"), null);
  });

  test("should invalidate incorrect formats for time", () => {
    assert.strictEqual(isTimeValid("11:78"), false);
    assert.strictEqual(isTimeValid("118"), false);
    assert.strictEqual(isTimeValid("11u18"), false);
    assert.strictEqual(isTimeValid("-11H18"), false);
    assert.strictEqual(isTimeValid("3:38"), false);
  });
});
