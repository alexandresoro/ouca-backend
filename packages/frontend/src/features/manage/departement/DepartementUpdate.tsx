import type { Department, UpsertDepartmentInput } from "@ou-ca/api/models";
import type { FunctionComponent } from "react";
import type { SubmitHandler } from "react-hook-form";
import DepartementEdit from "./DepartementEdit";

type DepartementUpdateProps = {
  department: Department;
  onCancel: () => void;
  onSubmit: (id: string, input: UpsertDepartmentInput) => void;
};

const DepartementUpdate: FunctionComponent<DepartementUpdateProps> = ({ department, onCancel, onSubmit }) => {
  const handleSubmit: SubmitHandler<UpsertDepartmentInput> = (input) => {
    onSubmit(department.id, input);
  };

  return <DepartementEdit defaultValues={department} onCancel={onCancel} onSubmit={handleSubmit} />;
};

export default DepartementUpdate;
