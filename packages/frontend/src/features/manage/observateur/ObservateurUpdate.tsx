import type { UpsertObserverInput } from "@ou-ca/api/models";
import type { Observer } from "@ou-ca/common/api/entities/observer";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import ObservateurEdit from "./ObservateurEdit";

type ObservateurUpdateProps = {
  observer: Observer;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertObserverInput) => void;
};

const ObservateurUpdate: FunctionComponent<ObservateurUpdateProps> = ({ observer, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertObserverInput> = (input) => {
    onSubmit(observer.id, input);
  };

  return <ObservateurEdit defaultValues={observer} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default ObservateurUpdate;
