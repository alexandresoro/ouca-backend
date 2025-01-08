import TextInput from "@components/base/TextInput";
import FormSelect from "@components/form/FormSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNotifications } from "@hooks/useNotifications";
import type { UpsertTownInput } from "@ou-ca/api/models";
import { upsertTownInput } from "@ou-ca/common/api/town";
import { useApiDepartmentsQuery } from "@services/api/department/api-department-queries";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type CommuneEditProps = {
  defaultValues?: UpsertTownInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertTownInput>;
};

const CommuneEdit: FunctionComponent<CommuneEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const { displayNotification } = useNotifications();

  const {
    register,
    control,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertTownInput>({
    defaultValues: defaultValues ?? {
      code: undefined,
      nom: "",
      departmentId: undefined,
    },
    resolver: zodResolver(upsertTownInput),
    mode: "onTouched",
  });

  const { data: departments, isLoading: loadingDepartments } = useApiDepartmentsQuery(
    {
      orderBy: "code",
      sortOrder: "asc",
    },
    {
      onError: () => {
        displayNotification({
          type: "error",
          message: t("retrieveGenericError"),
        });
      },
    },
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormSelect
        autoFocus
        name="departmentId"
        label={t("department")}
        required
        control={control}
        data={departments?.data}
        renderValue={({ code }) => code}
      />

      <TextInput label={t("townCode")} type="text" required {...register("code")} hasError={!!errors.code} />
      <TextInput label={t("townName")} type="text" required {...register("nom")} hasError={!!errors.nom} />

      <EntityUpsertFormActionButtons
        className="mt-6"
        onCancelClick={onCancel}
        disabled={loadingDepartments || !isValid || !isDirty}
      />
    </form>
  );
};

export default CommuneEdit;
