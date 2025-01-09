export const parseISO8601AsUTCDate = (date: string): Date => {
  return new Date(Date.parse(date));
};

export const getDateOnlyAsUTCDate = (date: Date): Date => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000);
};

export const getDateOnlyAsLocalISOString = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const offsetDate = new Date(date.getTime() - offset * 60 * 1000);
  return offsetDate.toISOString().split("T")[0];
};
