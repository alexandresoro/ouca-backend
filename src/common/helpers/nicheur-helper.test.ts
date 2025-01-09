import assert from "node:assert";
import test from "node:test";
import { NICHEUR_CERTAIN, NICHEUR_PROBABLE, type NicheurCode } from "../types/nicheur.model.js";
import { getHighestNicheurStatus, getNicheurStatusToDisplay } from "./nicheur-helper.js";

test("should return correct value when no nicheur code provided", () => {
  const comportementsEmpty: { nicheur?: NicheurCode | null }[] = [];
  assert.strictEqual(getHighestNicheurStatus(comportementsEmpty), null);
});

test("should return correct value with one code provided", () => {
  const comportementsSingle: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "certain",
    },
  ];
  assert.strictEqual(getHighestNicheurStatus(comportementsSingle), "certain");
});

test("should return correct value with similar codes provided", () => {
  const comportementsSimilar: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "probable",
    },
    {
      nicheur: "probable",
    },
  ];
  assert.strictEqual(getHighestNicheurStatus(comportementsSimilar), "probable");
});

test("should return correct value with different codes provided", () => {
  const comportementsDifferent: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "possible",
    },
    {
      nicheur: "certain",
    },
  ];
  assert.strictEqual(getHighestNicheurStatus(comportementsDifferent), "certain");
});

test("should return correct value with a complex case", () => {
  const comportementsComplex: { nicheur?: NicheurCode | null }[] = [
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
  assert.strictEqual(getHighestNicheurStatus(comportementsComplex), "probable");
});

test("should return the default text when no element supplied", () => {
  const comportementsEmpty: { nicheur?: NicheurCode | null }[] = [];
  assert.strictEqual(getNicheurStatusToDisplay(comportementsEmpty, "defaultText"), "defaultText");
});

test("should return the default text when no code supplied", () => {
  const comportementMultiplesEmpty: { nicheur?: NicheurCode | null }[] = [{}, {}, {}];
  assert.strictEqual(getNicheurStatusToDisplay(comportementMultiplesEmpty, "defaultText"), "defaultText");
});

test("should return correct value with one code provided", () => {
  const comportementsSingle: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "certain",
    },
  ];
  assert.strictEqual(getNicheurStatusToDisplay(comportementsSingle, "defaultText"), NICHEUR_CERTAIN.name);
});

test("should return correct value with similar codes provided", () => {
  const comportementsSimilar: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "probable",
    },
    {
      nicheur: "probable",
    },
  ];
  assert.strictEqual(getNicheurStatusToDisplay(comportementsSimilar, "defaultText"), NICHEUR_PROBABLE.name);
});

test("should return correct value with different codes provided", () => {
  const comportementsDifferent: { nicheur?: NicheurCode | null }[] = [
    {
      nicheur: "possible",
    },
    {
      nicheur: "certain",
    },
  ];
  assert.strictEqual(getNicheurStatusToDisplay(comportementsDifferent, "defaultText"), NICHEUR_CERTAIN.name);
});

test("should return correct value with a complex case", () => {
  const comportementsComplex: { nicheur?: NicheurCode | null }[] = [
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
  assert.strictEqual(getNicheurStatusToDisplay(comportementsComplex, "defaultText"), NICHEUR_PROBABLE.name);
});
