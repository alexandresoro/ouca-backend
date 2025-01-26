import { beforeEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { createUserInputFactory, userFactory, userSettingsFactory } from "@fixtures/domain/user/user.fixtures.js";
import type { UserRepository } from "@interfaces/user-repository-interface.js";
import { mock } from "../../../utils/mock.js";
import { buildUserService } from "./user-service.js";

const userRepository = mock<UserRepository>();

const userService = buildUserService({
  userRepository,
});

beforeEach(() => {
  userRepository.updateUserSettings.mockReset();
});

describe("User creation", () => {
  test("should handle creation of user", async () => {
    const signupData = createUserInputFactory.build();

    await userService.createUser(signupData);

    assert.strictEqual(userRepository.createUser.mock.calls.length, 1);
  });
});

describe("User settings update", () => {
  test("should be able to update settings", async () => {
    const loggedUser = loggedUserFactory.build();
    const settings = userSettingsFactory.build();

    userRepository.updateUserSettings.mockImplementationOnce(() =>
      Promise.resolve(userFactory.build({ id: loggedUser.id, settings })),
    );

    await userService.updateSettings(loggedUser.id, settings);

    assert.strictEqual(userRepository.updateUserSettings.mock.calls.length, 1);
    assert.deepStrictEqual(userRepository.updateUserSettings.mock.calls[0], [loggedUser.id, settings]);
  });
});
