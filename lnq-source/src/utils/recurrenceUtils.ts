import dayjs from "dayjs";
import {
  RepetitionSettings,
  RepeatEnum,
  RepeatIntervalUnit,
  MonthlyRepeatType,
} from "../types/Repetition";
import { formatDateWithOrdinal } from "./dateUtils";

export const getRecurrenceDisplayText = (settings: RepetitionSettings): string => {
  const {
    repeat,
    repeatEvery,
    repeatOn,
    repeatIntervalUnit,
    ends,
    endsOn,
    afterOccurrences,
    monthlyRepeatType,
    dayOfMonth,
    weekOfMonth,
  } = settings;

  // Ensure repeatOn is always an array and convert to string[]
  const safeRepeatOn = Array.isArray(repeatOn) ? repeatOn.map((day) => day.toString()) : [];

  let displayText = "";

  switch (repeat) {
    case RepeatEnum.DAILY:
      displayText = repeatEvery === 1 ? "Every day" : `Every ${repeatEvery} days`;
      break;
    case RepeatEnum.WEEKLY:
      displayText = getWeeklyDisplayText(repeatEvery, safeRepeatOn);
      break;
    case RepeatEnum.MONTHLY:
      displayText = getMonthlyDisplayText(
        repeatEvery,
        monthlyRepeatType,
        dayOfMonth,
        weekOfMonth,
        safeRepeatOn,
      );
      break;
    case RepeatEnum.CUSTOM:
      displayText = getCustomDisplayText(
        repeatIntervalUnit,
        repeatEvery,
        safeRepeatOn,
        monthlyRepeatType,
        dayOfMonth,
        weekOfMonth,
      );
      break;
    default:
      displayText = "Custom";
  }

  displayText += getEndConditionText(ends, endsOn, afterOccurrences);

  return displayText;
};

const getWeeklyDisplayText = (repeatEvery: number, repeatOn?: string[]): string => {
  if (!repeatOn || repeatOn.length === 0) {
    return repeatEvery === 1 ? "Every week" : `Every ${repeatEvery} weeks`;
  }

  if (repeatEvery === 1) {
    if (repeatOn && repeatOn.length === 1) {
      return `Every ${repeatOn[0] || ""}`;
    }
    const days =
      repeatOn && repeatOn.length > 0
        ? repeatOn.map((day) => day.slice(0, 3)).join(", ")
        : "";
    return `Every ${days}`;
  }

  const days =
    repeatOn && repeatOn.length > 0
      ? repeatOn.map((day) => day.slice(0, 3)).join(", ")
      : "";
  return `Every ${repeatEvery} weeks on ${days}`;
};

const getMonthlyDisplayText = (
  repeatEvery: number,
  monthlyRepeatType?: MonthlyRepeatType,
  dayOfMonth?: number,
  weekOfMonth?: number,
  repeatOn?: string[],
): string => {
  if (monthlyRepeatType === MonthlyRepeatType.DAY_OF_MONTH && dayOfMonth) {
    return repeatEvery === 1
      ? `Monthly on ${dayOfMonth}th`
      : `Every ${repeatEvery} months on ${dayOfMonth}th`;
  }

  if (
    monthlyRepeatType === MonthlyRepeatType.NTH_DAY_OF_WEEK &&
    weekOfMonth &&
    repeatOn &&
    repeatOn.length > 0
  ) {
    const dayName = repeatOn[0]?.slice(0, 3) || "";
    const ordinal = getOrdinalSuffix(weekOfMonth);
    return repeatEvery === 1
      ? `Monthly on ${ordinal} ${dayName}`
      : `Every ${repeatEvery} months on ${ordinal} ${dayName}`;
  }

  return repeatEvery === 1 ? "Monthly" : `Every ${repeatEvery} months`;
};

const getCustomDisplayText = (
  repeatIntervalUnit: RepeatIntervalUnit,
  repeatEvery: number,
  repeatOn?: string[],
  monthlyRepeatType?: MonthlyRepeatType,
  dayOfMonth?: number,
  weekOfMonth?: number,
): string => {
  switch (repeatIntervalUnit) {
    case RepeatIntervalUnit.DAY:
      return repeatEvery === 1 ? "Every day" : `Every ${repeatEvery} days`;
    case RepeatIntervalUnit.WEEK:
      return getWeeklyDisplayText(repeatEvery, repeatOn);
    case RepeatIntervalUnit.MONTH:
      return getMonthlyDisplayText(
        repeatEvery,
        monthlyRepeatType,
        dayOfMonth,
        weekOfMonth,
        repeatOn,
      );
    case RepeatIntervalUnit.YEAR: {
      const currentDate = new Date();
      const formattedDate = formatDateWithOrdinal(currentDate);

      return repeatEvery === 1
        ? `Yearly on ${formattedDate}`
        : `Every ${repeatEvery} years on ${formattedDate}`;
    }
    default:
      return "Custom";
  }
};

const getEndConditionText = (
  ends: string,
  endsOn?: Date,
  afterOccurrences?: number,
): string => {
  if (ends === "after_occurrences" && afterOccurrences) {
    return ` (${afterOccurrences} times)`;
  }

  if (ends === "on_date" && endsOn) {
    const endDate = dayjs(endsOn).format("MMM D, YYYY");
    return ` until ${endDate}`;
  }

  return "";
};

const getOrdinalSuffix = (num: number): string => {
  if (num === 1) return "1st";
  if (num === 2) return "2nd";
  if (num === 3) return "3rd";
  return `${num}th`;
};
