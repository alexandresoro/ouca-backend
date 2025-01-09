import Avatar from "@components/common/Avatar";
import { useUser } from "@hooks/useUser";
import type { Entry } from "@ou-ca/api/models";
import { getHighestBreederStatus } from "@utils/breeder-helper";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

type EntrySummaryContentProps = {
  entry: Entry;
};

const EntrySummaryContent: FunctionComponent<EntrySummaryContentProps> = ({ entry }) => {
  const { t } = useTranslation();

  const nicheurStatus = getHighestBreederStatus(entry.behaviors);

  const user = useUser();

  return (
    <div className="flex flex-col gap-5 px-4">
      <div>
        <div className="title-with-divider">{t("observationDetails.observedSpecimens")}</div>
        <div className="flex flex-col gap-2">
          <div className="first-letter:capitalize">
            {t("observationDetails.species")} : {entry.species.nomFrancais} –
            <span className="font-style: italic"> {entry.species.nomLatin}</span>
          </div>

          <div className="flex gap-20">
            <div className="first-letter:capitalize">
              {t("observationDetails.number", {
                context: entry.number != null ? "defined" : "undefined",
                number: entry.number,
                numberPrecision: entry.numberEstimate?.libelle,
              })}
            </div>

            <div className="first-letter:capitalize">
              {t("observationDetails.sex")} : {entry.sex.libelle}
            </div>

            <div className="first-letter:capitalize">
              {t("observationDetails.age")} : {entry.age.libelle}
            </div>
          </div>

          {(entry.distanceEstimate || entry.distance) && (
            <div>
              {t("observationDetails.distance", {
                context:
                  entry?.distance != null && entry.distanceEstimate
                    ? "both"
                    : entry.distance != null
                      ? "valueOnly"
                      : entry.distanceEstimate
                        ? "precisionOnly"
                        : "none",
                distance: entry.distance,
                distancePrecision: entry.distanceEstimate?.libelle,
              })}
            </div>
          )}
        </div>
      </div>

      {entry.behaviors.length > 0 && (
        <div>
          <div className="title-with-divider">
            <span>{t("behaviors")}</span>
          </div>
          {entry.behaviors.map(({ libelle }) => (
            <span key={libelle} className="badge badge-outline m-1 p-3 text-base">
              {libelle}
            </span>
          ))}
          {nicheurStatus && (
            <span className="badge badge-outline badge-accent m-1 p-3 text-base">
              {t(`breedingStatus.${nicheurStatus}`)}
            </span>
          )}
        </div>
      )}

      {entry.environments.length > 0 && (
        <div>
          <div className="title-with-divider">{t("observationDetails.environments")}</div>
          {entry.environments.map(({ libelle }) => (
            <span key={libelle} className="badge badge-outline m-1 p-3 text-base">
              {libelle}
            </span>
          ))}
        </div>
      )}

      {entry.comment && (
        <div>
          <div className="title-with-divider">{t("comments")}</div>
          <div className="chat chat-start">
            <div className="chat-image">
              <Avatar name={user?.fullName ?? null} />
            </div>
            <div className="chat-bubble chat-bubble-primary bg-opacity-25 text-neutral display-linebreak">
              {entry.comment}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EntrySummaryContent;
