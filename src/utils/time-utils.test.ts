import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { getDateOnlyAsLocalISOString, getDateOnlyAsUTCDate, parseISO8601AsUTCDate } from "./time-utils.js";

test("should parse as UTC a valid date", () => {
  const date = "2022-02-28";
  assert.deepStrictEqual(parseISO8601AsUTCDate(date), new Date(Date.UTC(2022, 1, 28)));
});

describe("getDateOnlyAsUTCDate", () => {
  test("should return the UTC date", () => {
    const date = new Date(2022, 1, 28);
    assert.deepStrictEqual(getDateOnlyAsUTCDate(date), new Date(Date.UTC(2022, 1, 28)));
  });
});

describe("getDateOnlyAsLocalISOString", () => {
  test("should return the local date", () => {
    const date = new Date(2022, 1, 28);
    assert.strictEqual(getDateOnlyAsLocalISOString(date), "2022-02-28");
  });
});
