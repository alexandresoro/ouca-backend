import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Weather, WeatherCreateInput, WeatherFindManyInput } from "@domain/weather/weather.js";
import type { Result } from "neverthrow";

export type WeatherRepository = {
  findWeatherById: (id: number) => Promise<Weather | null>;
  findWeathersById: (ids: string[]) => Promise<Weather[]>;
  findWeathers: (
    { orderBy, sortOrder, q, offset, limit }: WeatherFindManyInput,
    ownerId?: string,
  ) => Promise<Weather[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createWeather: (weatherInput: WeatherCreateInput) => Promise<Result<Weather, EntityFailureReason>>;
  createWeathers: (weatherInputs: WeatherCreateInput[]) => Promise<Weather[]>;
  updateWeather: (weatherId: number, weatherInput: WeatherCreateInput) => Promise<Result<Weather, EntityFailureReason>>;
  deleteWeatherById: (weatherId: number) => Promise<Weather | null>;
};
