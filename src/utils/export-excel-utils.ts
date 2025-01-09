import exceljs from "exceljs";

export const writeExcelToBuffer = async (
  objects: Record<string, unknown>[],
  worksheetName: string,
): Promise<exceljs.Buffer> => {
  const workbook = new exceljs.Workbook();
  const sheet = workbook.addWorksheet(worksheetName);
  if (objects?.length) {
    sheet.columns = Object.keys(objects[0]).map((column) => {
      return {
        header: column,
        key: column,
        ...(column === "Date"
          ? {
              style: {
                numFmt: "dd/mm/yyyy",
              },
            }
          : {}),
      };
    });
    sheet.addRows(objects);
  }
  return workbook.xlsx.writeBuffer();
};
