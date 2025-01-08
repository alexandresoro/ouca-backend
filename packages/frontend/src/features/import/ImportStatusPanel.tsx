import type { getV1ImportStatusImportIdResponse } from "@ou-ca/api/zod/import.zod";
import { downloadBlob } from "@utils/dom/file-download-helper";
import { stringify } from "csv-stringify/browser/esm/sync";
import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import type { z } from "zod";
import type { ImportType } from "./import-type";

type ImportStatus = z.infer<typeof getV1ImportStatusImportIdResponse>;

type ImportStatusPanelProps = {
  importType: ImportType;
  status: ImportStatus | undefined;
  isImportOngoing: boolean;
};

const ImportStatusPanel: FunctionComponent<ImportStatusPanelProps> = ({ importType, status, isImportOngoing }) => {
  const { t } = useTranslation();

  const handleExportImportStatusResult = () => {
    if (status?.status !== "completed") {
      return;
    }

    const csvString = stringify(status.errors, {
      delimiter: ";",
      record_delimiter: "windows",
    });

    const filenameSuffix = t(`importPage.type.${importType}`).replaceAll(" ", "_");
    const filename = t("importPage.exportFileName", { suffix: filenameSuffix });

    downloadBlob(new Blob([csvString]), filename);
  };

  return (
    <>
      <h3 className="text-lg font-semibold mt-6">{t("importPage.statusTitle")}</h3>
      {status == null && !isImportOngoing && <p className="mt-2">{t("importPage.noOngoingImportStatus")}</p>}
      {status == null && isImportOngoing && <p className="mt-2">{t("importPage.importOngoingNoStatus")}</p>}
      {status != null && status.status === "notStarted" && (
        <p className="mt-2">{t("importPage.importStatus.notStarted")}</p>
      )}
      {status != null && status.status === "ongoing" && (
        <>
          <p className="mt-2">{t("importPage.importStatus.ongoing")}</p>
          {status.step === "processStarted" && (
            <p className="mt-2">{t("importPage.importStatus.ongoingStep.processStarted")}</p>
          )}
          {status.step === "importRetrieved" && (
            <p className="mt-2">{t("importPage.importStatus.ongoingStep.importRetrieved")}</p>
          )}
          {status.step === "retrievingRequiredData" && (
            <p className="mt-2">{t("importPage.importStatus.ongoingStep.retrievingRequiredData")}</p>
          )}
          {status.step === "validatingInputFile" && (
            <>
              <p className="mt-2">{t("importPage.importStatus.ongoingStep.validatingInputFile")}</p>
              <div className="stats shadow">
                <div className="stat place-items-center">
                  <div className="stat-title">{t("importPage.importStats.totalNumberOfLines")}</div>
                  <div className="stat-value">{status.totalLinesInFile}</div>
                  <div className="stat-desc">{t("importPage.importStats.totalNumberOfLinesDescription")}</div>
                </div>
                <div className="stat place-items-center">
                  <div className="stat-title">{t("importPage.importStats.progress")}</div>
                  <div className="stat-value">{`${
                    status.validEntries ? Math.floor((100 * status.validatedEntries) / status.validEntries) : 0
                  }%`}</div>
                  <div className="stat-desc">
                    {t("importPage.importStats.progressDescription", { count: status.validEntries })}
                  </div>
                </div>
                <div className={`stat place-items-center ${status.errors.length ? "text-error" : "text-success"}`}>
                  <div className="stat-title">{t("importPage.importStats.numberOfErrorLines")}</div>
                  <div className="stat-value">{status.errors.length}</div>
                  <div className="stat-desc">
                    {status.errors.length
                      ? t("importPage.importStats.numberOfErrorLinesDescriptionWithErrors")
                      : t("importPage.importStats.numberOfErrorLinesDescriptionNoErrors")}
                  </div>
                </div>
              </div>
            </>
          )}
          {status.step === "insertingImportedData" && (
            <p className="mt-2">{t("importPage.importStatus.ongoingStep.insertingImportedData")}</p>
          )}
        </>
      )}
      {!isImportOngoing && status != null && status.status === "failed" && (
        <p className="mt-2">{t("importPage.importStatus.failed")}</p>
      )}
      {!isImportOngoing && status != null && status.status === "completed" && (
        <>
          <p className="mt-2">{t("importPage.importStatus.completed")}</p>
          <div className="stats shadow">
            <div className="stat place-items-center">
              <div className="stat-title">{t("importPage.importStats.totalNumberOfLines")}</div>
              <div className="stat-value">{status.totalLinesInFile}</div>
              <div className="stat-desc">{t("importPage.importStats.totalNumberOfLinesDescription")}</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-title">{t("importPage.importStats.numberOfValidEntries")}</div>
              <div className="stat-value">{status.validEntries}</div>
              <div className="stat-desc">{t("importPage.importStats.numberOfValidEntriesDescription")}</div>
            </div>
            <div className={`stat place-items-center ${status.errors.length ? "text-error" : "text-success"}`}>
              <div className="stat-title">{t("importPage.importStats.numberOfErrorLines")}</div>
              <div className="stat-value">{status.errors.length}</div>
              <div className="stat-desc">
                {status.errors.length
                  ? t("importPage.importStats.numberOfErrorLinesDescriptionWithErrors")
                  : t("importPage.importStats.numberOfErrorLinesDescriptionNoErrors")}
              </div>
            </div>
          </div>
          {status.errors.length > 0 && (
            <div className="flex pt-8 pb-4 justify-center">
              <button
                type="button"
                className="btn btn-secondary uppercase"
                onClick={() => handleExportImportStatusResult()}
              >
                {t("importPage.exportImportErrorsLabel")}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ImportStatusPanel;
