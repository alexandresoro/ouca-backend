import type { CreateUserInput, User } from "@domain/user/user.js";
import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export const userSettingsFactory = Factory.define<NonNullable<User["settings"]>>(() => {
  return {
    defaultObserverId: faker.string.sample(),
    defaultDepartmentId: faker.string.sample(),
    defaultAgeId: faker.string.sample(),
    defaultSexId: faker.string.sample(),
    defaultNumberEstimateId: faker.string.sample(),
    defaultNumber: faker.number.int(),
    displayAssociates: faker.datatype.boolean(),
    displayWeather: faker.datatype.boolean(),
    displayDistance: faker.datatype.boolean(),
  };
});

export const userFactory = Factory.define<User>(() => {
  return {
    id: faker.string.uuid(),
    extProviderId: faker.string.sample(),
    extProviderName: faker.string.alpha(),
    settings: userSettingsFactory.build(),
  };
});

export const createUserInputFactory = Factory.define<CreateUserInput>(() => {
  return {
    extProvider: faker.string.alpha(),
    extProviderUserId: faker.string.sample(),
  };
});
