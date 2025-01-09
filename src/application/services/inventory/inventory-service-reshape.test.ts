import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { localityFactory } from "@fixtures/domain/locality/locality.fixtures.js";
import { upsertInventoryInputFactory } from "@fixtures/services/inventory/inventory-service.fixtures.js";
import { reshapeInputInventoryUpsertData } from "./inventory-service-reshape.js";

describe("Reshape input inventory", () => {
  test("should handle when custom coordinates are provided", () => {
    const inventory = upsertInventoryInputFactory.build({
      coordinates: {
        altitude: 23,
        latitude: 45,
        longitude: 67,
      },
      duration: null,
    });
    const locality = localityFactory.build({
      altitude: 12,
      latitude: 34,
      longitude: 56,
    });

    const inventoryReshaped = reshapeInputInventoryUpsertData(inventory, locality);
    assert.deepStrictEqual(inventoryReshaped.customizedCoordinates, {
      altitude: 23,
      latitude: 45,
      longitude: 67,
    });
  });

  test("should handle when custom coordinates are provided and at least one differs from locality", () => {
    const inventory = upsertInventoryInputFactory.build({
      coordinates: {
        altitude: 23,
        latitude: 34,
        longitude: 56,
      },
      duration: null,
    });
    const locality = localityFactory.build({
      altitude: 12,
      latitude: 34,
      longitude: 56,
    });

    const inventoryReshaped = reshapeInputInventoryUpsertData(inventory, locality);
    assert.deepStrictEqual(inventoryReshaped.customizedCoordinates, {
      altitude: 23,
      latitude: 34,
      longitude: 56,
    });
  });

  test("should handle when custom coordinates provided are similar to locality ones", () => {
    const inventory = upsertInventoryInputFactory.build({
      coordinates: {
        altitude: 12,
        latitude: 34,
        longitude: 56,
      },
      duration: null,
    });
    const locality = localityFactory.build({
      altitude: 12,
      latitude: 34,
      longitude: 56,
    });

    const inventoryReshaped = reshapeInputInventoryUpsertData(inventory, locality);
    assert.strictEqual(inventoryReshaped.customizedCoordinates, null);
  });

  test("should handle when custom coordinates are not provided", () => {
    const inventory = upsertInventoryInputFactory.build({
      coordinates: null,
      duration: null,
    });
    const locality = localityFactory.build({
      altitude: 12,
      latitude: 34,
      longitude: 56,
    });

    const inventoryReshaped = reshapeInputInventoryUpsertData(inventory, locality);
    assert.strictEqual(inventoryReshaped.customizedCoordinates, null);
  });

  test("should handle simple duration when provided", () => {
    const inventory = upsertInventoryInputFactory.build({
      duration: 23,
    });
    const locality = localityFactory.build();

    const inventoryReshaped = reshapeInputInventoryUpsertData(inventory, locality);
    assert.strictEqual(inventoryReshaped.duration, "00:23");
  });

  test("should handle long duration when provided", () => {
    const inventory = upsertInventoryInputFactory.build({
      duration: 123,
    });
    const locality = localityFactory.build();

    const inventoryReshaped = reshapeInputInventoryUpsertData(inventory, locality);
    assert.strictEqual(inventoryReshaped.duration, "02:03");
  });
});
