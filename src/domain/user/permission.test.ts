import { describe, test } from "bun:test";
import assert from "node:assert/strict";
import { mergePermissions } from "@domain/user/permissions.js";

describe("mergePermissions", () => {
  test("should allow nothing if no permission provided", () => {
    const permissions = mergePermissions([]);

    assert.deepStrictEqual(permissions, {
      observer: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      department: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      town: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      locality: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      weather: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      speciesClass: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      species: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      age: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      sex: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      numberEstimate: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      distanceEstimate: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      behavior: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      environment: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      canViewAllEntries: false,
      canManageAllEntries: false,
      canImport: false,
    });
  });

  test("should merge partial permissions", () => {
    const firstPermissions = {
      observer: {
        canCreate: true,
      },
      department: {
        canEdit: true,
      },
      town: {
        canDelete: true,
      },
    };

    const secondPermissions = {
      observer: {
        canEdit: true,
      },
      locality: {
        canCreate: true,
      },
    };

    const permissions = mergePermissions([firstPermissions, secondPermissions]);

    assert.deepStrictEqual(permissions, {
      observer: {
        canCreate: true,
        canEdit: true,
        canDelete: false,
      },
      department: {
        canCreate: false,
        canEdit: true,
        canDelete: false,
      },
      town: {
        canCreate: false,
        canEdit: false,
        canDelete: true,
      },
      locality: {
        canCreate: true,
        canEdit: false,
        canDelete: false,
      },
      weather: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      speciesClass: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      species: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      age: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      sex: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      numberEstimate: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      distanceEstimate: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      behavior: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      environment: {
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
      canViewAllEntries: false,
      canManageAllEntries: false,
      canImport: false,
    });
  });
});
