import type { Species } from "@ou-ca/api/models";
import { useApiSpeciesInfoQuery } from "@services/api/species/api-species-queries";
import { useAtomValue } from "jotai";
import type { FunctionComponent } from "react";
import { searchEntriesCriteriaAtom } from "../searchEntriesCriteriaAtom";

type SearchSpeciesTableRowProps = {
  species: Species;
};

const SearchSpeciesTableRow: FunctionComponent<SearchSpeciesTableRowProps> = ({ species }) => {
  const searchCriteria = useAtomValue(searchEntriesCriteriaAtom);

  const { data: speciesInfo } = useApiSpeciesInfoQuery(species.id, { ...searchCriteria });

  return (
    <tr className="table-hover" key={species.id}>
      <td>{species.speciesClass?.libelle}</td>
      <td>{species.code}</td>
      <td>{species.nomFrancais}</td>
      <td>{species.nomLatin}</td>
      <td>{searchCriteria.fromAllUsers ? speciesInfo?.totalEntriesCount : speciesInfo?.ownEntriesCount}</td>
    </tr>
  );
};

export default SearchSpeciesTableRow;
