import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Town } from "@ou-ca/api/models";
import { useApiTownInfoQuery } from "@services/api/town/api-town-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type TownTableRowProps = {
  town: Town;
  onEditClicked?: (town: Town) => void;
  onDeleteClicked?: (town: Town) => void;
};

const TownTableRow: FunctionComponent<TownTableRowProps> = ({ town, onEditClicked, onDeleteClicked }) => {
  const { data: townInfo } = useApiTownInfoQuery(town.id);

  const user = useUser();

  const isOwner = user != null && town?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{townInfo?.departmentCode}</td>
      <td>{town.code}</td>
      <td>{town.nom}</td>
      <td>{townInfo?.localitiesCount}</td>
      <td>{townInfo?.ownEntriesCount}</td>
      <td align="center">
        <AvatarWithUniqueNameAvatar input={town.ownerId} />
      </td>
      <td align="center">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.town.canEdit}
          canDelete={townInfo?.canBeDeleted && (isOwner || user?.permissions.town.canDelete)}
          onEditClicked={() => onEditClicked?.(town)}
          onDeleteClicked={() => onDeleteClicked?.(town)}
        />
      </td>
    </tr>
  );
};

export default TownTableRow;
