import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const timeZoneOptions = [
  { label: "(ET) Eastern Time - New York", value: "America/New_York" },
  { label: "(CT) Central Time - Chicago", value: "America/Chicago" },
  { label: "(MT) Mountain Time - Denver", value: "America/Denver" },
  { label: "(PT) Pacific Time - Los Angeles", value: "America/Los_Angeles" },
  { label: "(AKT) Alaska Time - Anchorage", value: "America/Anchorage" },
  { label: "(MT) Mountain Time - Phoenix", value: "America/Phoenix" },
  { label: "(HT) Hawaii-Aleutian Time - Honolulu", value: "Pacific/Honolulu" },
];

export const timeZoneFullNames: Record<string, string> = {
  "America/New_York": "Eastern Time (ET)",
  "America/Chicago": "Central Time (CT)",
  "America/Denver": "Mountain Time (MT)",
  "America/Los_Angeles": "Pacific Time (PT)",
  "America/Anchorage": "Alaska Time (AKT)",
  "America/Phoenix": "Mountain Time (MT)",
  "Pacific/Honolulu": "Hawaii-Aleutian Time (HT)",
};

export const timeZoneAbbreviations: Record<string, string> = {
  "America/New_York": "ET",
  "America/Chicago": "CT",
  "America/Denver": "MT",
  "America/Los_Angeles": "PT",
  "America/Anchorage": "AKT",
  "America/Phoenix": "MT",
  "Pacific/Honolulu": "HT",
};

export const UTCToTimezone = {
  "-12:00": "BIT",
  "-11:00": "SST",
  "-10:00": "HST",
  "-09:00": "AKST",
  "-08:00": "PST",
  "-07:00": "MST",
  "-06:00": "CST",
  "-05:00": "EST",
  "-04:00": "AST",
  "-03:00": "WGT",
  "-02:00": "MDT",
  "-01:00": "GMT-1",
  "00:00": "GMT",
  "01:00": "CET",
  "02:00": "CEST",
  "03:00": "EAT",
  "04:00": "MSK",
  "05:00": "PKT",
  "06:00": "BST",
  "07:00": "ICT",
  "08:00": "CST",
  "09:00": "JST",
  "10:00": "AEST",
  "11:00": "VUT",
  "12:00": "NZST",
};

export const extractUTCOffset = (qGendaUTCTimezoneFormat: string) =>
  qGendaUTCTimezoneFormat.slice(4, 10);

export const getUtcOffset = (timezone: string): string => {
  const offset = dayjs().tz(timezone).format("Z");
  return offset;
};

export const getUserTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getTimeZoneAbbreviation = (timeZone: string) => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timeZone,
    timeZoneName: "short",
  };
  return (
    new Intl.DateTimeFormat("en-US", options)
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
};
