import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Environment } from "@ou-ca/api/models";
import { useApiEnvironmentInfoQuery } from "@services/api/environment/api-environment-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type EnvironmentTableRowProps = {
  environment: Environment;
  onEditClicked?: (environment: Environment) => void;
  onDeleteClicked?: (environment: Environment) => void;
};

const EnvironmentTableRow: FunctionComponent<EnvironmentTableRowProps> = ({
  environment,
  onEditClicked,
  onDeleteClicked,
}) => {
  const { data: environmentInfo } = useApiEnvironmentInfoQuery(environment.id);

  const user = useUser();

  const isOwner = user != null && environment?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{environment.code}</td>
      <td>{environment.libelle}</td>
      <td>{environmentInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={environment.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.environment.canEdit}
          canDelete={environmentInfo?.canBeDeleted && (isOwner || user?.permissions.environment.canDelete)}
          onEditClicked={() => onEditClicked?.(environment)}
          onDeleteClicked={() => onDeleteClicked?.(environment)}
        />
      </td>
    </tr>
  );
};

export default EnvironmentTableRow;
