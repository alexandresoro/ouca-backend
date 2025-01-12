import { z } from "zod";

const MINUTES_IN_HOUR = 60;
const MAX_SUPPORTED_MINUTES = 99 * MINUTES_IN_HOUR + 59; //FIXME: Database does not allow more than 5 characters currently

const TIME_REGEX = /(^[0-9]{1,2}(:|h|H)[0-5][0-9]$)|(^[0-9]+$)/;
export const validTimeSchema = z
  .string()
  .regex(TIME_REGEX)
  .refine((timeStr) => {
    return !/^[0-9]+$/.test(timeStr) || Number.parseInt(timeStr) <= MAX_SUPPORTED_MINUTES;
  });

export const getMinutesFromTime = (timeStr: string): number => {
  const validTimeResult = validTimeSchema.safeParse(timeStr);
  if (!validTimeResult.success) {
    return Number.NaN;
  }

  const { data: validTime } = validTimeResult;

  // Format is in minutes
  if (/^[0-9]+$/.test(validTime)) {
    const validTimeInt = Number.parseInt(validTime);
    return validTimeInt;
  }

  // Format is a time
  const matchTime = validTime.match(/^([0-9]{1,2})(:|h|H)([0-5][0-9])$/);
  if (matchTime != null) {
    return Number.parseInt(matchTime[1]) * MINUTES_IN_HOUR + Number.parseInt(matchTime[3]);
  }

  return Number.NaN;
};

const validMinutesSchema = z.number().min(0).safe().int().max(MAX_SUPPORTED_MINUTES); //Database does not allow more than 5 characters

export const getHumanFriendlyTimeFromMinutes = (minutes: number): string => {
  const validMinutes = validMinutesSchema.parse(minutes);
  const hours = Math.floor(validMinutes / MINUTES_IN_HOUR);
  const minutesFormatted = (validMinutes - MINUTES_IN_HOUR * hours).toString().padStart(2, "0");
  return `${hours.toString().padStart(2, "0")}:${minutesFormatted}`;
};
