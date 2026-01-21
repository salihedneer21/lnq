// types/Repetition.ts

export enum RepeatEnum {
  ONCE = "once",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  CUSTOM = "custom",
}

export enum RepeatDay {
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
  SUNDAY = "Sunday",
}

export enum RepeatIntervalUnit {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export enum RepeatEnds {
  NEVER = "never",
  ON_DATE = "on_date",
  AFTER_OCCURRENCES = "after_occurrences",
}

export enum MonthlyRepeatType {
  DAY_OF_MONTH = "day_of_month",
  NTH_DAY_OF_WEEK = "nth_day_of_week",
}

export interface RepetitionSettings {
  id: string;
  repeat: RepeatEnum;
  repeatOn?: RepeatDay[] | null;
  repeatEvery: number;
  repeatUntil?: Date;
  repeatIntervalUnit: RepeatIntervalUnit;
  ends: RepeatEnds;
  endsOn?: Date;
  afterOccurrences?: number;
  monthlyRepeatType?: MonthlyRepeatType;
  dayOfMonth?: number;
  weekOfMonth?: number;
  repeatEnded?: boolean;
  repeatEndedAt?: Date;
  name?: string;
}

export const defaultRepetitionSettings: RepetitionSettings = {
  id: "",
  repeat: RepeatEnum.DAILY,
  repeatEvery: 1,
  repeatIntervalUnit: RepeatIntervalUnit.DAY,
  ends: RepeatEnds.NEVER,
  repeatOn: [],
};
