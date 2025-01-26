import { test } from "bun:test";
import assert from "node:assert";
import type { BreederCode } from "@domain/behavior/breeder.js";
import { BREEDER_NAMES, getNicheurStatusToDisplay } from "./breeder-helper.js";

test("should return the default text when no element supplied", () => {
  const comportementsEmpty: { nicheur?: BreederCode | null }[] = [];
  assert.strictEqual(getNicheurStatusToDisplay(comportementsEmpty, "defaultText"), "defaultText");
});

test("should return the default text when no code supplied", () => {
  const comportementMultiplesEmpty: { nicheur?: BreederCode | null }[] = [{}, {}, {}];
  assert.strictEqual(getNicheurStatusToDisplay(comportementMultiplesEmpty, "defaultText"), "defaultText");
});

test("should return correct value with one code provided", () => {
  const comportementsSingle: { nicheur?: BreederCode | null }[] = [
    {
      nicheur: "certain",
    },
  ];
  assert.strictEqual(getNicheurStatusToDisplay(comportementsSingle, "defaultText"), BREEDER_NAMES.certain);
});

test("should return correct value with similar codes provided", () => {
  const comportementsSimilar: { nicheur?: BreederCode | null }[] = [
    {
      nicheur: "probable",
    },
    {
      nicheur: "probable",
    },
  ];
  assert.strictEqual(getNicheurStatusToDisplay(comportementsSimilar, "defaultText"), BREEDER_NAMES.probable);
});

test("should return correct value with different codes provided", () => {
  const comportementsDifferent: { nicheur?: BreederCode | null }[] = [
    {
      nicheur: "possible",
    },
    {
      nicheur: "certain",
    },
  ];
  assert.strictEqual(getNicheurStatusToDisplay(comportementsDifferent, "defaultText"), BREEDER_NAMES.certain);
});

test("should return correct value with a complex case", () => {
  const comportementsComplex: { nicheur?: BreederCode | null }[] = [
    {
      nicheur: "possible",
    },
    {
      nicheur: "probable",
    },
    {
      nicheur: "possible",
    },
    {},
    {
      nicheur: "possible",
    },
  ];
  assert.strictEqual(getNicheurStatusToDisplay(comportementsComplex, "defaultText"), BREEDER_NAMES.probable);
});
