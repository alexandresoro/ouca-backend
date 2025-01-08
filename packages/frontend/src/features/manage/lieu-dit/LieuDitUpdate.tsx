import type { Locality, UpsertLocalityInput } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import LieuDitEdit from "./LieuDitEdit";

type LieuDitUpdateProps = {
  locality: Locality;
  selectedDepartmentId: string;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertLocalityInput) => void;
};

const LieuDitUpdate: FunctionComponent<LieuDitUpdateProps> = ({
  locality,
  selectedDepartmentId,
  onCancel,
  onSubmit,
}) => {
  const handleSubmit: SubmitHandler<UpsertLocalityInput> = (input) => {
    onSubmit(locality.id, input);
  };

  const defaultValues = {
    nom: locality.nom,
    townId: locality.townId,
    latitude: locality.coordinates.latitude,
    longitude: locality.coordinates.longitude,
    altitude: locality.coordinates.altitude,
  } satisfies UpsertLocalityInput;

  return (
    <LieuDitEdit
      defaultValues={defaultValues}
      defaultDepartmentId={selectedDepartmentId}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  );
};

export default LieuDitUpdate;
