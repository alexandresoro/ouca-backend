import type { ImportStatus } from "@domain/import/import-status.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { SandboxedJob } from "bullmq";
import { parse } from "csv-parse/sync";
import { logger } from "../../../../utils/logger.js";
import type { Services } from "../../services.js";

const COMMENT_PREFIX = "###";

export abstract class ImportService {
  protected services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  public importFile = async (importId: string, loggedUser: LoggedUser, job: SandboxedJob): Promise<void> => {
    await job.updateProgress({
      importId,
      userId: loggedUser.id,
      status: "ongoing",
      step: "processStarted",
    } satisfies ImportStatus);

    const importData = await this.services.importService.getUploadData(importId);

    if (!importData) {
      await job.updateProgress({
        importId,
        userId: loggedUser.id,
        status: "failed",
        reason: "Uploaded file could not be read",
      } satisfies ImportStatus);
      return;
    }

    await job.updateProgress({
      importId,
      userId: loggedUser.id,
      status: "ongoing",
      step: "importRetrieved",
    } satisfies ImportStatus);

    const content: string[][] = parse(importData, {
      delimiter: ";",
      encoding: "utf-8",
    });

    if (!content.length) {
      await job.updateProgress({
        importId,
        userId: loggedUser.id,
        status: "completed",
        totalLinesInFile: 0,
        validEntries: 0,
        validatedEntries: 0,
        errors: [[]],
      } satisfies ImportStatus);
      return;
    }

    const numberOfLines = content.filter((lineTab) => {
      return lineTab.length > 0 && !lineTab[0].startsWith(COMMENT_PREFIX);
    }).length;
    const errors = [] as string[][];
    let validatedEntries = 0;

    await job.updateProgress({
      importId,
      userId: loggedUser.id,
      status: "ongoing",
      step: "retrievingRequiredData",
    } satisfies ImportStatus);

    // Retrieve any initialization info needed before validation
    await this.init(loggedUser);

    await job.updateProgress({
      importId,
      userId: loggedUser.id,
      status: "ongoing",
      step: "validatingInputFile",
      totalLinesInFile: content.length,
      validEntries: numberOfLines,
      validatedEntries,
      errors,
    } satisfies ImportStatus);

    // Validate all entries
    for (const lineTab of content) {
      if (lineTab.length > 0 && !lineTab[0].startsWith(COMMENT_PREFIX)) {
        let errorMessage: string | null;
        if (lineTab?.length !== this.getNumberOfColumns()) {
          errorMessage = `Le nombre de colonnes de cette ligne est incorrect: ${
            lineTab.length
          } colonne(s) au lieu de ${this.getNumberOfColumns()} attendue(s)`;
        } else {
          errorMessage = await this.validateAndPrepareEntity(lineTab, loggedUser);
        }

        if (errorMessage) {
          errors.push(this.buildErrorObject(lineTab, errorMessage));
        }

        validatedEntries++;

        await job.updateProgress({
          importId,
          userId: loggedUser.id,
          status: "ongoing",
          step: "validatingInputFile",
          totalLinesInFile: content.length,
          validEntries: numberOfLines,
          validatedEntries,
          errors,
        } satisfies ImportStatus);
      }
    }

    await job.updateProgress({
      importId,
      userId: loggedUser.id,
      status: "ongoing",
      step: "insertingImportedData",
      totalLinesInFile: content.length,
      validEntries: numberOfLines,
      validatedEntries,
      errors,
    } satisfies ImportStatus);

    // Insert the valid entries in the database
    await this.persistAllValidEntities(loggedUser);

    logger.debug(
      {
        importId,
      },
      `Import result : ${numberOfLines - errors.length}/${numberOfLines} successfully imported --> ${
        errors.length
      } lines failed to import`,
    );

    await job.updateProgress({
      importId,
      userId: loggedUser.id,
      status: "completed",
      totalLinesInFile: content.length,
      validEntries: numberOfLines,
      validatedEntries: numberOfLines - errors.length,
      errors,
    } satisfies ImportStatus);
  };

  protected abstract getNumberOfColumns(): number;

  protected abstract init(loggedUser: LoggedUser): Promise<void>;

  protected abstract persistAllValidEntities(loggedUser: LoggedUser): Promise<void>;

  protected abstract validateAndPrepareEntity(
    entityTab: string[],
    loggedUser: LoggedUser,
  ): string | null | Promise<string | null>;

  private buildErrorObject = (entityTab: string[], errorMessage: string): string[] => {
    entityTab.push(errorMessage);
    return entityTab;
  };

  protected compareStrings = (string1: string | null | undefined, string2: string | null | undefined): boolean => {
    if (!string1 && !string2) {
      return true;
    }

    if (!string1 || !string2) {
      return false;
    }

    return string1.trim().localeCompare(string2.trim(), "fr", { sensitivity: "base" }) === 0;
  };
}
