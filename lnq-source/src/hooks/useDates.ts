import dayjs from "dayjs";
import { useMemo } from "react";

const generateDatesForPeriod = (startDate: Date, endDate: Date) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const diffInDays = end.diff(start, "days");

  const arrayOfDays = [];
  let currentDate = start;
  for (let i = 0; i < diffInDays; i++) {
    arrayOfDays.push(currentDate);
    currentDate = currentDate.clone().add(1, "day");
  }
  return arrayOfDays;
};

export const useDateRange = ({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) => {
  const days = useMemo(
    () => generateDatesForPeriod(startDate, endDate),
    [startDate, endDate],
  );
  return {
    days,
  };
};
