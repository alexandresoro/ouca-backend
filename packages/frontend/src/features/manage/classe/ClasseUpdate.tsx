import type { SpeciesClass, UpsertSpeciesClassInput } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import ClasseEdit from "./ClasseEdit";

type ClasseUpdateProps = {
  speciesClass: SpeciesClass;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertSpeciesClassInput) => void;
};

const ClasseUpdate: FunctionComponent<ClasseUpdateProps> = ({ speciesClass, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertSpeciesClassInput> = (input) => {
    onSubmit(speciesClass.id, input);
  };

  return <ClasseEdit defaultValues={speciesClass} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default ClasseUpdate;
