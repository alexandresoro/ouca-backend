import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Age } from "@ou-ca/api/models";
import { useApiAgeInfoQuery } from "@services/api/age/api-age-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type AgeTableRowProps = {
  age: Age;
  onEditClicked?: (age: Age) => void;
  onDeleteClicked?: (age: Age) => void;
};

const AgeTableRow: FunctionComponent<AgeTableRowProps> = ({ age, onEditClicked, onDeleteClicked }) => {
  const { data: ageInfo } = useApiAgeInfoQuery(age.id);

  const user = useUser();

  const isOwner = user != null && age?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{age.libelle}</td>
      <td>{ageInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={age.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.age.canEdit}
          canDelete={ageInfo?.canBeDeleted && (isOwner || user?.permissions.age.canDelete)}
          onEditClicked={() => onEditClicked?.(age)}
          onDeleteClicked={() => onDeleteClicked?.(age)}
        />
      </td>
    </tr>
  );
};

export default AgeTableRow;
