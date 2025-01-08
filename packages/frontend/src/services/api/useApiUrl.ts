import { configAtom } from "@services/config/config";
import { useAtomValue } from "jotai";

const API_PATH = "/v1";

export const useApiUrl = () => {
  const config = useAtomValue(configAtom);
  const apiUrl = config.apiUrl;

  return `${apiUrl}${API_PATH}`;
};
