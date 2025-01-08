import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Species } from "@ou-ca/api/models";
import { useApiSpeciesInfoQuery } from "@services/api/species/api-species-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type SpeciesTableRowProps = {
  species: Species;
  onEditClicked?: (species: Species) => void;
  onDeleteClicked?: (species: Species) => void;
};

const SpeciesTableRow: FunctionComponent<SpeciesTableRowProps> = ({ species, onEditClicked, onDeleteClicked }) => {
  const { data: speciesInfo } = useApiSpeciesInfoQuery(species.id);

  const user = useUser();

  const isOwner = user != null && species?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{species.speciesClass?.libelle}</td>
      <td>{species.code}</td>
      <td>{species.nomFrancais}</td>
      <td>{species.nomLatin}</td>
      <td>{speciesInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={species.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.species.canEdit}
          canDelete={speciesInfo?.canBeDeleted && (isOwner || user?.permissions.species.canDelete)}
          onEditClicked={() => onEditClicked?.(species)}
          onDeleteClicked={() => onDeleteClicked?.(species)}
        />
      </td>
    </tr>
  );
};

export default SpeciesTableRow;
