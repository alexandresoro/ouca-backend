import TextInput from "@components/base/TextInput";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UpsertSpeciesClassInput } from "@ou-ca/api/models";
import { upsertClassInput } from "@ou-ca/common/api/species-class";
import type { FunctionComponent } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import EntityUpsertFormActionButtons from "../common/EntityUpsertFormActionButtons";

type ClasseEditProps = {
  defaultValues?: UpsertSpeciesClassInput | null;
  onCancel: () => void;
  onSubmit: SubmitHandler<UpsertSpeciesClassInput>;
};

const ClasseEdit: FunctionComponent<ClasseEditProps> = (props) => {
  const { defaultValues, onCancel, onSubmit } = props;

  const { t } = useTranslation();

  const {
    register,
    formState: { isValid, isDirty, errors },
    handleSubmit,
  } = useForm<UpsertSpeciesClassInput>({
    defaultValues: defaultValues ?? {
      libelle: "",
    },
    resolver: zodResolver(upsertClassInput),
    mode: "onTouched",
  });

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          autoFocus
          label={t("label")}
          type="text"
          required
          {...register("libelle")}
          hasError={!!errors.libelle}
        />
        <EntityUpsertFormActionButtons className="mt-6" onCancelClick={onCancel} disabled={!isValid || !isDirty} />
      </form>
    </>
  );
};

export default ClasseEdit;
