import { beforeEach, describe, test } from "bun:test";
import assert from "node:assert/strict";
import { weatherCreateInputFactory } from "@fixtures/domain/species-class/species-class.fixtures.js";
import { loggedUserFactory } from "@fixtures/domain/user/logged-user.fixtures.js";
import { weatherFactory } from "@fixtures/domain/weather/weather.fixtures.js";
import { upsertWeatherInputFactory } from "@fixtures/services/weather/weather-service.fixtures.js";
import type { WeatherRepository } from "@interfaces/weather-repository-interface.js";
import type { WeathersSearchParams } from "@ou-ca/common/api/weather.js";
import { err, ok } from "neverthrow";
import { mock } from "../../../utils/mock.js";
import { buildWeatherService } from "./weather-service.js";

const weatherRepository = mock<WeatherRepository>();

const weatherService = buildWeatherService({
  weatherRepository,
});

beforeEach(() => {
  weatherRepository.findWeatherById.mockReset();
  weatherRepository.findWeathersById.mockReset();
  weatherRepository.findWeathers.mockReset();
  weatherRepository.createWeather.mockReset();
  weatherRepository.createWeathers.mockReset();
  weatherRepository.updateWeather.mockReset();
  weatherRepository.deleteWeatherById.mockReset();
  weatherRepository.getCount.mockReset();
  weatherRepository.getEntriesCountById.mockReset();
});

describe("Find weather", () => {
  test("should handle a matching weather", async () => {
    const weatherData = weatherFactory.build();
    const loggedUser = loggedUserFactory.build();

    weatherRepository.findWeatherById.mockImplementationOnce(() => Promise.resolve(weatherData));

    await weatherService.findWeather(12, loggedUser);

    assert.strictEqual(weatherRepository.findWeatherById.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.findWeatherById.mock.calls[0], [12]);
  });

  test("should handle weather not found", async () => {
    weatherRepository.findWeatherById.mockImplementationOnce(() => Promise.resolve(null));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await weatherService.findWeather(10, loggedUser), ok(null));

    assert.strictEqual(weatherRepository.findWeatherById.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.findWeatherById.mock.calls[0], [10]);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await weatherService.findWeather(11, null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(weatherRepository.findWeatherById.mock.calls.length, 0);
  });
});

describe("Find weathers by IDs", () => {
  test("should handle a matching weather", async () => {
    const weathersData = weatherFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    weatherRepository.findWeathersById.mockImplementationOnce(() => Promise.resolve(weathersData));

    await weatherService.findWeathers(["12", "13", "14"], loggedUser);

    assert.strictEqual(weatherRepository.findWeathersById.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.findWeathersById.mock.calls[0], [["12", "13", "14"]]);
  });

  test("should handle weather not found", async () => {
    weatherRepository.findWeathersById.mockImplementationOnce(() => Promise.resolve([]));
    const loggedUser = loggedUserFactory.build();

    assert.deepStrictEqual(await weatherService.findWeathers(["10", "11"], loggedUser), ok([]));

    assert.strictEqual(weatherRepository.findWeathersById.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.findWeathersById.mock.calls[0], [["10", "11"]]);
  });

  test("should handle no ids provided", async () => {
    const loggedUser = loggedUserFactory.build();

    const findResult = await weatherService.findWeathers([], loggedUser);

    assert.ok(findResult.isOk());
    assert.deepStrictEqual(findResult.value, []);
    assert.strictEqual(weatherRepository.findWeathersById.mock.calls.length, 0);
  });

  test("should not be allowed when the no login details are provided", async () => {
    const findResult = await weatherService.findWeathers(["11", "12"], null);

    assert.deepStrictEqual(findResult, err("notAllowed"));
    assert.strictEqual(weatherRepository.findWeathersById.mock.calls.length, 0);
  });
});

describe("Data count per entity", () => {
  test("should request the correct parameters", async () => {
    const loggedUser = loggedUserFactory.build();

    await weatherService.getEntriesCountByWeather("12", loggedUser);

    assert.strictEqual(weatherRepository.getEntriesCountById.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.getEntriesCountById.mock.calls[0], ["12", loggedUser.id]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await weatherService.getEntriesCountByWeather("12", null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

test("Find all weathers", async () => {
  const weathersData = weatherFactory.buildList(3);

  weatherRepository.findWeathers.mockImplementationOnce(() => Promise.resolve(weathersData));

  await weatherService.findAllWeathers();

  assert.strictEqual(weatherRepository.findWeathers.mock.calls.length, 1);
  assert.deepStrictEqual(weatherRepository.findWeathers.mock.calls[0], [
    {
      orderBy: "libelle",
    },
  ]);
});

describe("Entities paginated find by search criteria", () => {
  test("should handle being called without query params", async () => {
    const weathersData = weatherFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    weatherRepository.findWeathers.mockImplementationOnce(() => Promise.resolve(weathersData));

    await weatherService.findPaginatedWeathers(loggedUser, {});

    assert.strictEqual(weatherRepository.findWeathers.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.findWeathers.mock.calls[0], [
      {
        limit: undefined,
        offset: undefined,
        orderBy: undefined,
        q: undefined,
        sortOrder: undefined,
      },
      loggedUser.id,
    ]);
  });

  test("should handle params when retrieving paginated weathers", async () => {
    const weathersData = weatherFactory.buildList(3);
    const loggedUser = loggedUserFactory.build();

    const searchParams: WeathersSearchParams = {
      orderBy: "libelle",
      sortOrder: "desc",
      q: "Bob",
      pageNumber: 1,
      pageSize: 10,
    };

    weatherRepository.findWeathers.mockImplementationOnce(() => Promise.resolve([weathersData[0]]));

    await weatherService.findPaginatedWeathers(loggedUser, searchParams);

    assert.strictEqual(weatherRepository.findWeathers.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.findWeathers.mock.calls[0], [
      {
        q: "Bob",
        orderBy: "libelle",
        sortOrder: "desc",
        offset: 0,
        limit: searchParams.pageSize,
      },
      loggedUser.id,
    ]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesPaginatedResult = await weatherService.findPaginatedWeathers(null, {});

    assert.deepStrictEqual(entitiesPaginatedResult, err("notAllowed"));
  });
});

describe("Entities count by search criteria", () => {
  test("should handle to be called without criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await weatherService.getWeathersCount(loggedUser);

    assert.strictEqual(weatherRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.getCount.mock.calls[0], [undefined]);
  });

  test("should handle to be called with some criteria provided", async () => {
    const loggedUser = loggedUserFactory.build();

    await weatherService.getWeathersCount(loggedUser, "test");

    assert.strictEqual(weatherRepository.getCount.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.getCount.mock.calls[0], ["test"]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const entitiesCountResult = await weatherService.getWeathersCount(null);

    assert.deepStrictEqual(entitiesCountResult, err("notAllowed"));
  });
});

describe("Update of an weather", () => {
  test("should be allowed when user has permission", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { weather: { canEdit: true } } });

    weatherRepository.updateWeather.mockImplementationOnce(() => Promise.resolve(ok(weatherFactory.build())));

    await weatherService.updateWeather(12, weatherData, loggedUser);

    assert.strictEqual(weatherRepository.updateWeather.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.updateWeather.mock.calls[0], [12, weatherData]);
  });

  test("should be allowed when requested by the owner", async () => {
    const existingData = weatherFactory.build({
      ownerId: "notAdmin",
    });

    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ id: "notAdmin" });

    weatherRepository.findWeatherById.mockImplementationOnce(() => Promise.resolve(existingData));
    weatherRepository.updateWeather.mockImplementationOnce(() => Promise.resolve(ok(weatherFactory.build())));

    await weatherService.updateWeather(12, weatherData, loggedUser);

    assert.strictEqual(weatherRepository.updateWeather.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.updateWeather.mock.calls[0], [12, weatherData]);
  });

  test("should not be allowed when requested by an use that is nor owner nor has permission", async () => {
    const existingData = weatherFactory.build({
      ownerId: "notAdmin",
    });

    const weatherData = upsertWeatherInputFactory.build();

    const user = loggedUserFactory.build();

    weatherRepository.findWeatherById.mockImplementationOnce(() => Promise.resolve(existingData));

    const updateResult = await weatherService.updateWeather(12, weatherData, user);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(weatherRepository.updateWeather.mock.calls.length, 0);
  });

  test("should not be allowed when trying to update to an weather that exists", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { weather: { canEdit: true } } });

    weatherRepository.updateWeather.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const updateResult = await weatherService.updateWeather(12, weatherData, loggedUser);

    assert.deepStrictEqual(updateResult, err("alreadyExists"));
    assert.strictEqual(weatherRepository.updateWeather.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.updateWeather.mock.calls[0], [12, weatherData]);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const updateResult = await weatherService.updateWeather(12, weatherData, null);

    assert.deepStrictEqual(updateResult, err("notAllowed"));
    assert.strictEqual(weatherRepository.updateWeather.mock.calls.length, 0);
  });
});

describe("Creation of an weather", () => {
  test("should create new weather", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { weather: { canCreate: true } } });

    weatherRepository.createWeather.mockImplementationOnce(() => Promise.resolve(ok(weatherFactory.build())));

    await weatherService.createWeather(weatherData, loggedUser);

    assert.strictEqual(weatherRepository.createWeather.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.createWeather.mock.calls[0], [
      {
        ...weatherData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed when trying to create an weather that already exists", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { weather: { canCreate: true } } });

    weatherRepository.createWeather.mockImplementationOnce(() => Promise.resolve(err("alreadyExists")));

    const createResult = await weatherService.createWeather(weatherData, loggedUser);

    assert.deepStrictEqual(createResult, err("alreadyExists"));
    assert.strictEqual(weatherRepository.createWeather.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.createWeather.mock.calls[0], [
      {
        ...weatherData,
        ownerId: loggedUser.id,
      },
    ]);
  });

  test("should not be allowed if user has no permission", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const loggedUser = loggedUserFactory.build({ permissions: { weather: { canCreate: false } } });

    const createResult = await weatherService.createWeather(weatherData, loggedUser);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(weatherRepository.createWeather.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const weatherData = upsertWeatherInputFactory.build();

    const createResult = await weatherService.createWeather(weatherData, null);

    assert.deepStrictEqual(createResult, err("notAllowed"));
    assert.strictEqual(weatherRepository.createWeather.mock.calls.length, 0);
  });
});

describe("Deletion of an weather", () => {
  test("should handle the deletion of an owned weather", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const weather = weatherFactory.build({
      ownerId: loggedUser.id,
    });

    weatherRepository.findWeatherById.mockImplementationOnce(() => Promise.resolve(weather));

    await weatherService.deleteWeather(11, loggedUser);

    assert.strictEqual(weatherRepository.deleteWeatherById.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.deleteWeatherById.mock.calls[0], [11]);
  });

  test("should handle the deletion of any weather if has permission", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { weather: { canDelete: true } } });

    weatherRepository.findWeatherById.mockImplementationOnce(() => Promise.resolve(weatherFactory.build()));

    await weatherService.deleteWeather(11, loggedUser);

    assert.strictEqual(weatherRepository.deleteWeatherById.mock.calls.length, 1);
    assert.deepStrictEqual(weatherRepository.deleteWeatherById.mock.calls[0], [11]);
  });

  test("should not be allowed when trying to delete a non-owned weather and no permission", async () => {
    const loggedUser = loggedUserFactory.build({
      id: "12",
    });

    const deleteResult = await weatherService.deleteWeather(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(weatherRepository.deleteWeatherById.mock.calls.length, 0);
  });

  test("should not be allowed when the entity is used", async () => {
    const loggedUser = loggedUserFactory.build({ permissions: { weather: { canDelete: true } } });

    weatherRepository.getEntriesCountById.mockImplementationOnce(() => Promise.resolve(1));

    const deleteResult = await weatherService.deleteWeather(11, loggedUser);

    assert.deepStrictEqual(deleteResult, err("isUsed"));
    assert.strictEqual(weatherRepository.deleteWeatherById.mock.calls.length, 0);
  });

  test("should not be allowed when the requester is not logged", async () => {
    const deleteResult = await weatherService.deleteWeather(11, null);

    assert.deepStrictEqual(deleteResult, err("notAllowed"));
    assert.strictEqual(weatherRepository.deleteWeatherById.mock.calls.length, 0);
  });
});

test("Create multiple weathers", async () => {
  const weathersData = weatherCreateInputFactory.buildList(3);

  const loggedUser = loggedUserFactory.build();

  weatherRepository.createWeathers.mockImplementationOnce(() => Promise.resolve([]));

  await weatherService.createWeathers(weathersData, loggedUser);

  assert.strictEqual(weatherRepository.createWeathers.mock.calls.length, 1);
  assert.deepStrictEqual(weatherRepository.createWeathers.mock.calls[0], [
    weathersData.map((weather) => {
      return {
        ...weather,
        ownerId: loggedUser.id,
      };
    }),
  ]);
});
