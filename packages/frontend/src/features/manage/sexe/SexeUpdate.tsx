import type { Sex, UpsertSexInput } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import SexeEdit from "./SexeEdit";

type SexeUpdateProps = {
  sex: Sex;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertSexInput) => void;
};

const SexeUpdate: FunctionComponent<SexeUpdateProps> = ({ sex, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertSexInput> = (input) => {
    onSubmit(sex.id, input);
  };

  return <SexeEdit defaultValues={sex} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default SexeUpdate;
