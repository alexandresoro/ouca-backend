import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { SpeciesClass } from "@ou-ca/api/models";
import { useApiSpeciesClassInfoQuery } from "@services/api/species-class/api-species-class-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type SpeciesClassTableRowProps = {
  speciesClass: SpeciesClass;
  onEditClicked?: (speciesClass: SpeciesClass) => void;
  onDeleteClicked?: (speciesClass: SpeciesClass) => void;
};

const SpeciesClassTableRow: FunctionComponent<SpeciesClassTableRowProps> = ({
  speciesClass,
  onEditClicked,
  onDeleteClicked,
}) => {
  const { data: speciesClassInfo } = useApiSpeciesClassInfoQuery(speciesClass.id);

  const user = useUser();

  const isOwner = user != null && speciesClass?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{speciesClass.libelle}</td>
      <td>{speciesClassInfo?.speciesCount}</td>
      <td>{speciesClassInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={speciesClass.ownerId} />
      </td>
      <td align="center" className="w-32">
        {speciesClass != null && (
          <TableCellActionButtons
            canEdit={isOwner || user?.permissions.speciesClass.canEdit}
            canDelete={speciesClassInfo?.canBeDeleted && (isOwner || user?.permissions.speciesClass.canDelete)}
            onEditClicked={() => onEditClicked?.(speciesClass)}
            onDeleteClicked={() => onDeleteClicked?.(speciesClass)}
          />
        )}
      </td>
    </tr>
  );
};

export default SpeciesClassTableRow;
