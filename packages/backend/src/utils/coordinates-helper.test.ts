import assert from "node:assert";
import test from "node:test";
import type { Locality } from "@ou-ca/common/api/entities/locality";
import { areCoordinatesCustom } from "./coordinates-helper.js";

test("should correctly validate non-customized coordinated", () => {
  const locality: Locality = {
    id: "1",
    coordinates: {
      longitude: 10,
      latitude: -4,
      altitude: 45,
    },
    nom: "test",
    ownerId: "1",
    townId: "1",
  };

  assert.strictEqual(areCoordinatesCustom(locality, 45, 10, -4), false);
});

test("should correctly validate customized coordinated", () => {
  const locality: Locality = {
    id: "1",
    coordinates: {
      longitude: 10,
      latitude: -4,
      altitude: 45,
    },
    nom: "test",
    ownerId: "1",
    townId: "1",
  };

  assert.strictEqual(areCoordinatesCustom(locality, 33, 22, 11), true);
});
