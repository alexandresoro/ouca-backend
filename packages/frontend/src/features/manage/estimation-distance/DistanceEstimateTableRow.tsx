import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { DistanceEstimate } from "@ou-ca/api/models";
import { useApiDistanceEstimateInfoQuery } from "@services/api/distance-estimate/api-distance-estimate-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type DistanceEstimateTableRowProps = {
  distanceEstimate: DistanceEstimate;
  onEditClicked?: (distanceEstimate: DistanceEstimate) => void;
  onDeleteClicked?: (distanceestimate: DistanceEstimate) => void;
};

const DistanceEstimateTableRow: FunctionComponent<DistanceEstimateTableRowProps> = ({
  distanceEstimate,
  onEditClicked,
  onDeleteClicked,
}) => {
  const { data: distanceEstimateInfo } = useApiDistanceEstimateInfoQuery(distanceEstimate.id);

  const user = useUser();

  const isOwner = user != null && distanceEstimate?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{distanceEstimate.libelle}</td>
      <td>{distanceEstimateInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={distanceEstimate.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.distanceEstimate.canEdit}
          canDelete={distanceEstimateInfo?.canBeDeleted && (isOwner || user?.permissions.distanceEstimate.canDelete)}
          onEditClicked={() => onEditClicked?.(distanceEstimate)}
          onDeleteClicked={() => onDeleteClicked?.(distanceEstimate)}
        />
      </td>
    </tr>
  );
};

export default DistanceEstimateTableRow;
