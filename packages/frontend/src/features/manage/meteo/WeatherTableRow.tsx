import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Weather } from "@ou-ca/api/models";
import { useApiWeatherInfoQuery } from "@services/api/weather/api-weather-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type WeatherTableRowProps = {
  weather: Weather;
  onEditClicked?: (weather: Weather) => void;
  onDeleteClicked?: (weather: Weather) => void;
};

const WeatherTableRow: FunctionComponent<WeatherTableRowProps> = ({ weather, onEditClicked, onDeleteClicked }) => {
  const { data: weatherInfo } = useApiWeatherInfoQuery(weather.id);

  const user = useUser();

  const isOwner = user != null && weather?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{weather.libelle}</td>
      <td>{weatherInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={weather.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.weather.canEdit}
          canDelete={weatherInfo?.canBeDeleted && (isOwner || user?.permissions.weather.canDelete)}
          onEditClicked={() => onEditClicked?.(weather)}
          onDeleteClicked={() => onDeleteClicked?.(weather)}
        />
      </td>
    </tr>
  );
};

export default WeatherTableRow;
