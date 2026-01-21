export const handleEndsOnDateSelectable = (date: Date, lnqStartDate?: Date): boolean => {
  const minDate =
    lnqStartDate instanceof Date && !Number.isNaN(lnqStartDate.getTime())
      ? new Date(
          lnqStartDate.getFullYear(),
          lnqStartDate.getMonth(),
          lnqStartDate.getDate(),
        )
      : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  return date instanceof Date && !Number.isNaN(date.getTime()) && date >= minDate;
};

export const getDefaultEndDate = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const formatDateWithOrdinal = (date: Date): string => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = monthNames[date.getMonth()];
  const day = date.getDate();
  let suffix = "th";

  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";

  return `${monthName} ${day}${suffix}`;
};
