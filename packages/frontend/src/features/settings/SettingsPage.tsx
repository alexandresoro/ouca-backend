import TextInput from "@components/base/TextInput";
import FormSelect from "@components/form/FormSelect";
import FormSwitch from "@components/form/FormSwitch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNotifications } from "@hooks/useNotifications";
import { useUserSettings } from "@hooks/useUser";
import ContentContainerLayout from "@layouts/ContentContainerLayout";
import StyledPanelHeader from "@layouts/StyledPanelHeader";
import type { PutV1MeBody } from "@ou-ca/api/models";
import { putMeInput } from "@ou-ca/common/api/me";
import { useApiAgesQuery } from "@services/api/age/api-age-queries";
import { useApiDepartmentsQuery } from "@services/api/department/api-department-queries";
import { useApiSettingsUpdate } from "@services/api/me/api-me-queries";
import { useApiNumberEstimatesQuery } from "@services/api/number-estimate/api-number-estimate-queries";
import { useApiObserversQuery } from "@services/api/observer/api-observer-queries";
import { useApiSexesQuery } from "@services/api/sex/api-sex-queries";
import { type FunctionComponent, useCallback, useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

type SettingsInputs = {
  defaultObserver: string | null;
  defaultDepartment: string | null;
  defaultEstimationNombre: string | null;
  defaultNombre: string;
  defaultSexe: string | null;
  defaultAge: string | null;
  areAssociesDisplayed: boolean;
  isMeteoDisplayed: boolean;
  isDistanceDisplayed: boolean;
};

const SettingsPage: FunctionComponent = () => {
  const { t } = useTranslation();

  const { displayNotification } = useNotifications();

  const settings = useUserSettings();

  const { data: ages, error: isErrorAges, isLoading: isLoadingAges } = useApiAgesQuery({});

  const { data: departments, error: isErrorDepartments, isLoading: isLoadingDepartments } = useApiDepartmentsQuery({});

  const {
    data: numberEstimates,
    error: isErrorNumberEstimates,
    isLoading: isLoadingNumberEstimates,
  } = useApiNumberEstimatesQuery({});

  const { data: observers, error: isErrorObservers, isLoading: isLoadingObservers } = useApiObserversQuery({});

  const { data: sexes, error: isErrorSexes, isLoading: isLoadingSexes } = useApiSexesQuery({});

  const loading =
    isLoadingAges || isLoadingDepartments || isLoadingNumberEstimates || isLoadingObservers || isLoadingSexes;
  const error = isErrorAges || isErrorDepartments || isErrorNumberEstimates || isErrorObservers || isErrorSexes;

  const { trigger } = useApiSettingsUpdate({
    onSuccess: () => {
      displayNotification({
        type: "success",
        message: t("saveSettingsSuccess"),
      });
    },
    onError: () => {
      displayNotification({
        type: "error",
        message: t("saveSettingsError"),
      });
    },
  });

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<SettingsInputs>({
    defaultValues: {
      defaultObserver: null,
      defaultDepartment: null,
      defaultEstimationNombre: null,
      defaultNombre: "",
      defaultSexe: null,
      defaultAge: null,
      areAssociesDisplayed: false,
      isMeteoDisplayed: false,
      isDistanceDisplayed: false,
    },
    resolver: zodResolver(putMeInput),
  });

  useEffect(() => {
    reset({
      defaultObserver: settings?.defaultObserverId ?? null,
      defaultDepartment: settings?.defaultDepartmentId ?? null,
      defaultEstimationNombre: settings?.defaultNumberEstimateId ?? null,
      defaultNombre: settings?.defaultNumber != null ? `${settings.defaultNumber}` : "",
      defaultSexe: settings?.defaultSexId ?? null,
      defaultAge: settings?.defaultAgeId ?? null,
      areAssociesDisplayed: !!settings?.displayAssociates,
      isMeteoDisplayed: !!settings?.displayWeather,
      isDistanceDisplayed: !!settings?.displayDistance,
    });
  }, [settings, reset]);

  // Handle updated settings
  const sendUpdatedSettings: SubmitHandler<PutV1MeBody> = useCallback(
    (values) => {
      if (settings === undefined) {
        return;
      }
      void trigger({ body: values });
    },
    [trigger, settings],
  );

  // Watch inputs for changes, and submit the form if any
  useEffect(() => {
    const subscription = watch(() => {
      if (settings !== undefined) {
        void handleSubmit(sendUpdatedSettings as unknown as SubmitHandler<SettingsInputs>)();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, handleSubmit, sendUpdatedSettings, settings]);

  // Display a generic error message when something wrong happened while retrieving the settings
  useEffect(() => {
    if (error) {
      displayNotification({
        type: "error",
        message: t("retrieveSettingsError"),
      });
    }
  }, [t, displayNotification, error]);

  if (settings === undefined) {
    return null;
  }

  return (
    <>
      <StyledPanelHeader>
        <h1 className="text-2xl font-normal">{t("settings")}</h1>
      </StyledPanelHeader>
      <ContentContainerLayout>
        {loading && (
          <div className="flex justify-center items-center">
            <progress className="progress progress-primary w-56" />
          </div>
        )}
        {!(loading || error) && (
          <div className="card border-2 border-primary p-6 shadow-xl">
            <form className="flex justify-center items-center flex-col sm:flex-row gap-0 sm:gap-10 md:gap-16">
              <div className="flex flex-col w-full">
                <FormSelect
                  name="defaultObserver"
                  label={t("defaultObserver")}
                  control={control}
                  data={observers?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSelect
                  name="defaultDepartment"
                  label={t("defaultDepartment")}
                  control={control}
                  data={departments?.data}
                  renderValue={({ code }) => code}
                />

                <FormSelect
                  name="defaultEstimationNombre"
                  label={t("defaultNumberPrecision")}
                  control={control}
                  data={numberEstimates?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <TextInput
                  textInputClassName="w-full"
                  label={t("defaultNumber")}
                  type="number"
                  hasError={!!errors.defaultNombre}
                  className="text-base-content text-sm font-semibold"
                  {...register("defaultNombre", {
                    setValueAs: (v: string) => (v?.length ? Number.parseInt(v) : typeof v === "number" ? v : null),
                  })}
                />
              </div>

              <div className="flex flex-col w-full">
                <FormSelect
                  name="defaultSexe"
                  label={t("defaultSex")}
                  control={control}
                  data={sexes?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSelect
                  name="defaultAge"
                  label={t("defaultAge")}
                  control={control}
                  data={ages?.data}
                  renderValue={({ libelle }) => libelle}
                />

                <FormSwitch name="areAssociesDisplayed" label={t("displayAssociateObservers")} control={control} />

                <FormSwitch name="isMeteoDisplayed" label={t("displayWeather")} control={control} />

                <FormSwitch name="isDistanceDisplayed" label={t("displayDistance")} control={control} />
              </div>
            </form>
          </div>
        )}
      </ContentContainerLayout>
    </>
  );
};

export default SettingsPage;
