import { useMemo } from "react";
import { getUserTimeZone, getUtcOffset } from "../utils/timeZones";
import { getShortAbbreviationOfTimezone } from "../utils/dateFormatters";

export const useUserTimezoneSettings = () => {
  const userTimezone = useMemo(() => getUserTimeZone(), []);

  const userTimezoneAbbreviation = useMemo(
    () => getShortAbbreviationOfTimezone(userTimezone),
    [userTimezone],
  );
  const userTimezoneUTCOffset = useMemo(() => getUtcOffset(userTimezone), [userTimezone]);

  return {
    userTimezone,
    userTimezoneAbbreviation,
    userTimezoneUTCOffset,
  };
};

export type UserTimeSettings = ReturnType<typeof useUserTimezoneSettings>;
