import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Locality } from "@ou-ca/api/models";
import { useApiLocalityInfoQuery } from "@services/api/locality/api-locality-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type LocalityTableRowProps = {
  locality: Locality;
  onEditClicked?: (locality: Locality) => void;
  onDeleteClicked?: (locality: Locality) => void;
};

const LocalityTableRow: FunctionComponent<LocalityTableRowProps> = ({ locality, onEditClicked, onDeleteClicked }) => {
  const { data: localityInfo } = useApiLocalityInfoQuery(locality.id);

  const user = useUser();

  const isOwner = user != null && locality?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{localityInfo?.departmentCode}</td>
      <td>{localityInfo?.townCode}</td>
      <td>{localityInfo?.townName}</td>
      <td>{locality.nom}</td>
      <td>{locality.coordinates.latitude}</td>
      <td>{locality.coordinates.longitude}</td>
      <td>{locality.coordinates.altitude}</td>
      <td>{localityInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={locality.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.locality.canEdit}
          canDelete={localityInfo?.canBeDeleted && (isOwner || user?.permissions.locality.canDelete)}
          onEditClicked={() => onEditClicked?.(locality)}
          onDeleteClicked={() => onDeleteClicked?.(locality)}
        />
      </td>
    </tr>
  );
};

export default LocalityTableRow;
