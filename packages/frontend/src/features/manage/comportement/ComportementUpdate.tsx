import type { Behavior, UpsertBehaviorInput } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import ComportementEdit from "./ComportementEdit";

type ComportementUpdateProps = {
  behavior: Behavior;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertBehaviorInput) => void;
};

const ComportementUpdate: FunctionComponent<ComportementUpdateProps> = ({ behavior, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertBehaviorInput> = (input) => {
    onSubmit(behavior.id, input);
  };

  return <ComportementEdit defaultValues={behavior} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default ComportementUpdate;
