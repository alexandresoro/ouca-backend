import assert from "node:assert";
import test from "node:test";
import { type BreederCode, getHighestBreederStatus } from "./breeder.js";

test("should return correct value when no breeder code provided", () => {
  const breedersEmpty = [] satisfies (BreederCode | null)[];
  assert.strictEqual(getHighestBreederStatus(breedersEmpty), null);
});

test("should return correct value with one code provided", () => {
  const breedersSingle = ["certain"] satisfies (BreederCode | null)[];
  assert.strictEqual(getHighestBreederStatus(breedersSingle), "certain");
});

test("should return correct value with similar codes provided", () => {
  const breedersSimilar = ["probable", "probable"] satisfies (BreederCode | null)[];
  assert.strictEqual(getHighestBreederStatus(breedersSimilar), "probable");
});

test("should return correct value with different codes provided", () => {
  const breedersDifferent = ["possible", "certain"] satisfies (BreederCode | null)[];
  assert.strictEqual(getHighestBreederStatus(breedersDifferent), "certain");
});

test("should return correct value with a complex case", () => {
  const breedersComplex = ["possible", "probable", "possible", "possible"] satisfies (BreederCode | null)[];
  assert.strictEqual(getHighestBreederStatus(breedersComplex), "probable");
});
