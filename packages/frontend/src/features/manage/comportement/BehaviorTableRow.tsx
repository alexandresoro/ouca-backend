import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Behavior } from "@ou-ca/api/models";
import { useApiBehaviorInfoQuery } from "@services/api/behavior/api-behavior-queries";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import TableCellActionButtons from "../common/TableCellActionButtons";

type BehaviorTableRowProps = {
  behavior: Behavior;
  onEditClicked?: (behavior: Behavior) => void;
  onDeleteClicked?: (behavior: Behavior) => void;
};

const BehaviorTableRow: FunctionComponent<BehaviorTableRowProps> = ({ behavior, onEditClicked, onDeleteClicked }) => {
  const { data: behaviorInfo } = useApiBehaviorInfoQuery(behavior.id);

  const { t } = useTranslation();

  const user = useUser();

  const isOwner = user != null && behavior?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{behavior.code}</td>
      <td>{behavior.libelle}</td>
      <td>{behavior.nicheur ? t(`breedingStatus.${behavior.nicheur}`) : ""}</td>
      <td>{behaviorInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={behavior.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.behavior.canEdit}
          canDelete={behaviorInfo?.canBeDeleted && (isOwner || user?.permissions.behavior.canDelete)}
          onEditClicked={() => onEditClicked?.(behavior)}
          onDeleteClicked={() => onDeleteClicked?.(behavior)}
        />
      </td>
    </tr>
  );
};

export default BehaviorTableRow;
