import { getV1AltitudeResponse } from "@ou-ca/api/zod/location.zod";
import { fetchApi } from "@utils/fetch-api";

export const fetchApiAltitude = async (
  { latitude, longitude }: { latitude: number; longitude: number },
  {
    apiUrl,
    token,
  }: {
    apiUrl: string;
    token: string;
  },
) => {
  const searchParams = new URLSearchParams({
    latitude: `${latitude}`,
    longitude: `${longitude}`,
  });

  const url = `${apiUrl}/altitude?${searchParams.toString()}`;

  return fetchApi({
    url,
    token,
    schema: getV1AltitudeResponse,
  });
};
