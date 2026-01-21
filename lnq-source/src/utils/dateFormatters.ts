import dayjs from "dayjs";
import utcPlugin from "dayjs/plugin/utc";
import advancedPlugin from "dayjs/plugin/advancedFormat";

dayjs.extend(utcPlugin);
dayjs.extend(advancedPlugin);

const amPmTimeFormat = "hh:mm A";
const time24HTimeFormat = "HH:mm:ss";
const timeZoneAbbreviationRegex = /[^A-Z]/g;

export const get24TimeFromDate = (date: string) => {
  return dayjs.utc(date).format(time24HTimeFormat);
};

export const convertFromTimezoneToTimezone = (
  timeStr: string,
  fromUTCOffset: string,
  toUTCOffset: string,
): string => {
  const currentDate = dayjs().format("YYYY-MM-DD");
  const datetime = `${currentDate}T${timeStr}${fromUTCOffset}`;
  return dayjs.utc(datetime).utcOffset(toUTCOffset).format(amPmTimeFormat);
};

export const getShortAbbreviationOfTimezone = (timezone: string) => {
  return dayjs().tz(timezone).format("zzz").replace(timeZoneAbbreviationRegex, "");
};

export const formatShortDate = (date: Date | string): string => {
  return dayjs(date).format("DD MMM YYYY");
};
