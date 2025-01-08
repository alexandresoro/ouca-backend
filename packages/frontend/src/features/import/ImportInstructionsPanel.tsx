import type { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import ImportAgesPanel from "./entities/ImportAgesPanel";
import ImportBehaviorsPanel from "./entities/ImportBehaviorsPanel";
import ImportDepartmentsPanel from "./entities/ImportDepartmentsPanel";
import ImportDistanceEstimatesPanel from "./entities/ImportDistanceEstimatesPanel";
import ImportEntriesPanel from "./entities/ImportEntriesPanel";
import ImportEnvironmentsPanel from "./entities/ImportEnvironmentsPanel";
import ImportLocalitiesPanel from "./entities/ImportLocalitiesPanel";
import ImportNumberEstimatesPanel from "./entities/ImportNumberEstimatesPanel";
import ImportObserversPanel from "./entities/ImportObserversPanel";
import ImportSexesPanel from "./entities/ImportSexesPanel";
import ImportSpeciesClassesPanel from "./entities/ImportSpeciesClassesPanel";
import ImportSpeciesEstimatesPanel from "./entities/ImportSpeciesPanel";
import ImportTownsPanel from "./entities/ImportTownsPanel";
import ImportWeathersPanel from "./entities/ImportWeathersPanel";
import type { ImportType } from "./import-type";

const getImportComponent = (importType: ImportType) => () => {
  switch (importType) {
    case "observer":
      return <ImportObserversPanel />;
    case "department":
      return <ImportDepartmentsPanel />;
    case "town":
      return <ImportTownsPanel />;
    case "locality":
      return <ImportLocalitiesPanel />;
    case "weather":
      return <ImportWeathersPanel />;
    case "species-class":
      return <ImportSpeciesClassesPanel />;
    case "species":
      return <ImportSpeciesEstimatesPanel />;
    case "sex":
      return <ImportSexesPanel />;
    case "age":
      return <ImportAgesPanel />;
    case "number-estimate":
      return <ImportNumberEstimatesPanel />;
    case "distance-estimate":
      return <ImportDistanceEstimatesPanel />;
    case "behavior":
      return <ImportBehaviorsPanel />;
    case "environment":
      return <ImportEnvironmentsPanel />;
    case "entry":
      return <ImportEntriesPanel />;
    default:
      return <></>;
  }
};

type ImportInstructionsPanelProps = {
  importType: ImportType;
};

const ImportInstructionsPanel: FunctionComponent<ImportInstructionsPanelProps> = ({ importType }) => {
  const { t } = useTranslation();

  const ImportComponent = getImportComponent(importType);

  return (
    <>
      <h2 className="text-xl font-semibold mb-3">
        {t("importInstructions.entries.title", {
          importType: t(`importPage.type.${importType}`),
        })}
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-3">{t("importInstructions.shared.prerequisites.title")}</h3>
          <p>{t("importInstructions.shared.prerequisites.writeData")}</p>
          <p>{t("importInstructions.shared.prerequisites.saveFile")}</p>
          <p>{t("importInstructions.shared.prerequisites.checkList")}</p>
          <ul className="list-disc list-inside">
            <li>{t("importInstructions.shared.prerequisites.checkHeaders")}</li>
            <li>{t("importInstructions.shared.prerequisites.checkSeparators")}</li>
            <li>{t("importInstructions.shared.prerequisites.checkOrder")}</li>
            <li>{t("importInstructions.shared.prerequisites.checkRequiredColumns")}</li>
            <li>{t("importInstructions.shared.prerequisites.checkEndOfFile")}</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-3">{t("importInstructions.shared.results.title")}</h3>
          <p>{t("importInstructions.shared.results.process")}</p>
          <p>{t("importInstructions.shared.results.output")}</p>
        </div>

        <ImportComponent />
      </div>
    </>
  );
};

export default ImportInstructionsPanel;
