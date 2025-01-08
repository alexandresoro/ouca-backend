import TextInput from "@components/base/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpsertDepartmentInput } from "@ou-ca/api/models";
import { upsertDepartmentInput } from "@ou-ca/common/api/department";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type DepartementEditProps = {
  defaultValues?: UpsertDepartmentInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertDepartmentInput>;
};

const DepartementEdit: FunctionComponent<DepartementEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertDepartmentInput>({
    defaultValues: defaultValues ?? {
      code: "",
    },
    resolver: zodResolver(upsertDepartmentInput),
    mode: "onTouched",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput autoFocus label={t("code")} type="text" required {...register("code")} hasError={!!errors.code} />

      <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
    </form>
  );
};

export default DepartementEdit;
