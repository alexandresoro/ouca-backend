import type { UpsertDistanceEstimateInput } from "@ou-ca/api/models";
import type { DistanceEstimate } from "@ou-ca/common/api/entities/distance-estimate";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import EstimationDistanceEdit from "./EstimationDistanceEdit";

type EstimationDistanceUpdateProps = {
  distanceEstimate: DistanceEstimate;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertDistanceEstimateInput) => void;
};

const EstimationDistanceUpdate: FunctionComponent<EstimationDistanceUpdateProps> = ({
  distanceEstimate,
  onCancel,
  onSubmit,
}) => {
  const handleSubmit: SubmitHandler<UpsertDistanceEstimateInput> = (input) => {
    onSubmit(distanceEstimate.id, input);
  };

  return <EstimationDistanceEdit defaultValues={distanceEstimate} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default EstimationDistanceUpdate;
