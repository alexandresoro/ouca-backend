import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Sex } from "@ou-ca/api/models";
import { useApiSexInfoQuery } from "@services/api/sex/api-sex-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type SexTableRowProps = {
  sex: Sex;
  onEditClicked?: (sex: Sex) => void;
  onDeleteClicked?: (sex: Sex) => void;
};

const SexTableRow: FunctionComponent<SexTableRowProps> = ({ sex, onEditClicked, onDeleteClicked }) => {
  const { data: sexInfo } = useApiSexInfoQuery(sex.id);

  const user = useUser();

  const isOwner = user != null && sex?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{sex.libelle}</td>
      <td>{sexInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={sex.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.sex.canEdit}
          canDelete={sexInfo?.canBeDeleted && (isOwner || user?.permissions.sex.canDelete)}
          onEditClicked={() => onEditClicked?.(sex)}
          onDeleteClicked={() => onDeleteClicked?.(sex)}
        />
      </td>
    </tr>
  );
};

export default SexTableRow;
