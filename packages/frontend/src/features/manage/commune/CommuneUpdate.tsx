import type { UpsertTownInput } from "@ou-ca/api/models";
import type { Town } from "@ou-ca/common/api/entities/town";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import CommuneEdit from "./CommuneEdit";

type CommuneUpdateProps = {
  town: Town;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertTownInput) => void;
};

const CommuneUpdate: FunctionComponent<CommuneUpdateProps> = ({ town, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertTownInput> = (input) => {
    onSubmit(town.id, input);
  };

  return <CommuneEdit defaultValues={town} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default CommuneUpdate;
