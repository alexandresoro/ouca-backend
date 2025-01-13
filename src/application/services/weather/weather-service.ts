import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { Weather, WeatherCreateInput, WeatherFailureReason } from "@domain/weather/weather.js";
import type { WeatherRepository } from "@interfaces/weather-repository-interface.js";
import type { UpsertWeatherInput, WeathersSearchParams } from "@ou-ca/common/api/weather.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";

type WeatherServiceDependencies = {
  weatherRepository: WeatherRepository;
};

export const buildWeatherService = ({ weatherRepository }: WeatherServiceDependencies) => {
  const findWeather = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const weather = await weatherRepository.findWeatherById(id);
    return ok(weather);
  };

  const findWeathers = async (
    ids: string[],
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    if (ids.length === 0) {
      return ok([]);
    }

    const weathers = await weatherRepository.findWeathersById(ids);
    return ok(weathers);
  };

  const getEntriesCountByWeather = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await weatherRepository.getEntriesCountById(id, loggedUser.id));
  };

  const isWeatherUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalEntriesWithWeather = await weatherRepository.getEntriesCountById(id);

    return ok(totalEntriesWithWeather > 0);
  };

  const findAllWeathers = async (): Promise<Weather[]> => {
    const weathers = await weatherRepository.findWeathers({
      orderBy: "libelle",
    });

    return weathers;
  };

  const findPaginatedWeathers = async (
    loggedUser: LoggedUser | null,
    options: WeathersSearchParams,
  ): Promise<Result<Weather[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const weathers = await weatherRepository.findWeathers(
      {
        q,
        ...getSqlPagination(pagination),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return ok(weathers);
  };

  const getWeathersCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await weatherRepository.getCount(q));
  };

  const createWeather = async (
    input: UpsertWeatherInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather, WeatherFailureReason>> => {
    if (!loggedUser?.permissions.weather.canCreate) {
      return err("notAllowed");
    }

    // Create a new weather
    const createdWeatherResult = await weatherRepository.createWeather({
      ...input,
      ownerId: loggedUser?.id,
    });

    return createdWeatherResult;
  };

  const updateWeather = async (
    id: number,
    input: UpsertWeatherInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather, WeatherFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.weather.canEdit) {
      const existingData = await weatherRepository.findWeatherById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    // Update an existing weather
    const updatedWeatherResult = await weatherRepository.updateWeather(id, input);

    return updatedWeatherResult;
  };

  const deleteWeather = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Weather | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.weather.canDelete) {
      const existingData = await weatherRepository.findWeatherById(id);

      if (existingData?.ownerId !== loggedUser.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isWeatherUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedWeather = await weatherRepository.deleteWeatherById(id);
    return ok(deletedWeather);
  };

  const createWeathers = async (
    weathers: Omit<WeatherCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<Weather[]> => {
    const createdWeathers = await weatherRepository.createWeathers(
      weathers.map((weather) => {
        return { ...weather, ownerId: loggedUser.id };
      }),
    );

    return createdWeathers;
  };

  return {
    findWeather,
    findWeathers,
    getEntriesCountByWeather,
    isWeatherUsed,
    findAllWeathers,
    findPaginatedWeathers,
    getWeathersCount,
    createWeather,
    updateWeather,
    deleteWeather,
    createWeathers,
  };
};

export type WeatherService = ReturnType<typeof buildWeatherService>;
