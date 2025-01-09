import TextInput from "@components/base/TextInput";
import Select from "@components/base/select/Select";
import FormSelect from "@components/form/FormSelect";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNotifications } from "@hooks/useNotifications";
import type { Department, UpsertLocalityInput } from "@ou-ca/api/models";
import { putV1LocalitiesIdBody } from "@ou-ca/api/zod/location.zod";
import { useApiDepartmentsQuery } from "@services/api/department/api-department-queries";
import { useApiTownsQuery } from "@services/api/town/api-town-queries";
import { type FunctionComponent, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type LieuDitEditProps = {
  defaultValues?: UpsertLocalityInput | null;
  defaultDepartmentId?: string;
  onCancel?: () => void;
  onSubmit: SubmitHandler<UpsertLocalityInput>;
};

const LieuDitEdit: FunctionComponent<LieuDitEditProps> = (props) => {
  const { defaultValues, defaultDepartmentId, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const { displayNotification } = useNotifications();

  const {
    register,
    setValue,
    getValues,
    control,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertLocalityInput>({
    defaultValues: {
      nom: "",
      altitude: undefined,
      latitude: undefined,
      longitude: undefined,
      townId: "",
      ...defaultValues,
    },
    resolver: zodResolver(putV1LocalitiesIdBody),
    mode: "onTouched",
  });

  const [selectedDepartmentId, setSelectedDepartmentId] = useState(defaultDepartmentId);

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

  const { data: dataTowns, isLoading: loadingTowns } = useApiTownsQuery(
    {
      departmentId: selectedDepartmentId,
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
      onSuccess: (towns) => {
        // When the list of towns change, reset the selection if no longer in the new list
        const selectedCommuneId = getValues("townId");

        if (selectedCommuneId && !towns.data.map(({ id }) => id).includes(selectedCommuneId)) {
          setValue("townId", "", { shouldValidate: true });
        }
      },
    },
    {
      paused: !selectedDepartmentId,
    },
  );

  const handleOnChangeDepartment = (newDepartment: Department | undefined) => {
    setSelectedDepartmentId(newDepartment?.id);
  };

  const selectedDepartment =
    departments?.data?.find((department) => {
      return department.id === selectedDepartmentId;
    }) ?? null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-4">
        <Select
          autoFocus
          selectClassName="basis-1/4"
          label={t("department")}
          data={departments?.data}
          value={selectedDepartment}
          onChange={handleOnChangeDepartment}
          renderValue={(dept) => {
            return dept?.code ?? "";
          }}
        />

        <FormSelect
          selectClassName="basis-3/4"
          name="townId"
          label={t("town")}
          required
          control={control}
          data={dataTowns?.data}
          renderValue={({ code, nom }) => `${code} - ${nom}`}
        />
      </div>

      <TextInput label={t("localityName")} type="text" required {...register("nom")} hasError={!!errors.nom} />

      <h3 className="font-semibold mt-6">{t("localityCoordinates")}</h3>

      <div className="flex gap-4">
        <TextInput
          textInputClassName="basis-1/3"
          label={t("latitudeWithUnit")}
          type="number"
          step="any"
          required
          {...register("latitude", {
            valueAsNumber: true,
          })}
          hasError={!!errors.latitude}
        />

        <TextInput
          textInputClassName="basis-1/3"
          label={t("longitudeWithUnit")}
          type="number"
          step="any"
          required
          {...register("longitude", {
            valueAsNumber: true,
          })}
          hasError={!!errors.longitude}
        />

        <TextInput
          textInputClassName="basis-1/3"
          label={t("altitudeWithUnit")}
          type="number"
          step="any"
          required
          {...register("altitude", {
            valueAsNumber: true,
          })}
          hasError={!!errors.altitude}
        />
      </div>

      <EntityUpsertFormActionButtons
        className="mt-6"
        onCancelClick={onCancel}
        disabled={loadingTowns || loadingDepartments || !isValid || !isDirty}
      />
    </form>
  );
};

export default LieuDitEdit;
