import type { UpsertWeatherInput, Weather } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import MeteoEdit from "./MeteoEdit";

type MeteoUpdateProps = {
  weather: Weather;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertWeatherInput) => void;
};

const MeteoUpdate: FunctionComponent<MeteoUpdateProps> = ({ weather, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertWeatherInput> = (input) => {
    onSubmit(weather.id, input);
  };

  return <MeteoEdit defaultValues={weather} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default MeteoUpdate;
