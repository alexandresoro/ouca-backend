import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { NumberEstimate } from "@ou-ca/api/models";
import { useApiNumberEstimateInfoQuery } from "@services/api/number-estimate/api-number-estimate-queries";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import TableCellActionButtons from "../common/TableCellActionButtons";

type NumberEstimateTableRowProps = {
  numberEstimate: NumberEstimate;
  onEditClicked?: (numberEstimate: NumberEstimate) => void;
  onDeleteClicked?: (numberEstimate: NumberEstimate) => void;
};

const NumberEstimateTableRow: FunctionComponent<NumberEstimateTableRowProps> = ({
  numberEstimate,
  onEditClicked,
  onDeleteClicked,
}) => {
  const { data: numberEstimateInfo } = useApiNumberEstimateInfoQuery(numberEstimate.id);

  const { t } = useTranslation();

  const user = useUser();

  const isOwner = user != null && numberEstimate?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{numberEstimate.libelle}</td>
      <td>{numberEstimate.nonCompte ? t("yes") : ""}</td>
      <td>{numberEstimateInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={numberEstimate.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.numberEstimate.canEdit}
          canDelete={numberEstimateInfo?.canBeDeleted && (isOwner || user?.permissions.numberEstimate.canDelete)}
          onEditClicked={() => onEditClicked?.(numberEstimate)}
          onDeleteClicked={() => onDeleteClicked?.(numberEstimate)}
        />
      </td>
    </tr>
  );
};

export default NumberEstimateTableRow;
