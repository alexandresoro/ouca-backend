import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Observer } from "@ou-ca/api/models";
import { useApiObserverInfoQuery } from "@services/api/observer/api-observer-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type ObserverTableRowProps = {
  observer: Observer;
  onEditClicked?: (observer: Observer) => void;
  onDeleteClicked?: (observer: Observer) => void;
};

const ObserverTableRow: FunctionComponent<ObserverTableRowProps> = ({ observer, onEditClicked, onDeleteClicked }) => {
  const { data: observerInfo } = useApiObserverInfoQuery(observer.id);

  const user = useUser();

  const isOwner = user != null && observer?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{observer.libelle}</td>
      <td>{observerInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={observer.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.observer.canEdit}
          canDelete={observerInfo?.canBeDeleted && (isOwner || user?.permissions.observer.canDelete)}
          onEditClicked={() => onEditClicked?.(observer)}
          onDeleteClicked={() => onDeleteClicked?.(observer)}
        />
      </td>
    </tr>
  );
};

export default ObserverTableRow;
