import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { getHumanFriendlyTimeFromMinutes, getMinutesFromTime } from "./time-format-convert.js";

describe("getMinutesFromTime", () => {
  test("should parse HH:mm format", () => {
    assert.strictEqual(getMinutesFromTime("11:12"), 672);
    assert.strictEqual(getMinutesFromTime("0:25"), 25);
  });

  test("should parse HHhmm format", () => {
    assert.strictEqual(getMinutesFromTime("1h35"), 95);
    assert.strictEqual(getMinutesFromTime("0h25"), 25);
  });

  test("should parse HHHmm format", () => {
    assert.strictEqual(getMinutesFromTime("15H22"), 922);
    assert.strictEqual(getMinutesFromTime("0H25"), 25);
  });

  test("should parse minutes format", () => {
    assert.strictEqual(getMinutesFromTime("1023"), 1023);
    assert.strictEqual(getMinutesFromTime("145"), 145);
    assert.strictEqual(getMinutesFromTime("15"), 15);
    assert.strictEqual(getMinutesFromTime("6"), 6);
  });

  test("should return NaN for values that do no match any pattern", () => {
    assert.strictEqual(getMinutesFromTime("H13"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("h13"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("2:91"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("2H91"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("9h91"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("15o32"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("15H223"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("15:223"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("99bb"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("fail"), Number.NaN);
    assert.strictEqual(getMinutesFromTime(":34"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("6321"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("14.38"), Number.NaN);
    assert.strictEqual(getMinutesFromTime("6,35"), Number.NaN);
  });
});

describe("getHumanFriendlyTimeFromMinutes", () => {
  test("should parse minutes format", () => {
    assert.strictEqual(getHumanFriendlyTimeFromMinutes(1023), "17:03");
    assert.strictEqual(getHumanFriendlyTimeFromMinutes(145), "02:25");
    assert.strictEqual(getHumanFriendlyTimeFromMinutes(15), "00:15");
    assert.strictEqual(getHumanFriendlyTimeFromMinutes(6), "00:06");
  });

  test("should reject minutes that are not valid", () => {
    assert.throws(() => getHumanFriendlyTimeFromMinutes(15332));
    assert.throws(() => getHumanFriendlyTimeFromMinutes(-1));
    assert.throws(() => getHumanFriendlyTimeFromMinutes(4.7));
    assert.throws(() => getHumanFriendlyTimeFromMinutes(7 / 3));
    assert.throws(() => getHumanFriendlyTimeFromMinutes(Math.PI));
  });
});
