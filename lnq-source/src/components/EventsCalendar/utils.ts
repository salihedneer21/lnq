import dayjs from "dayjs";

export const getDefaultRange = () => {
  const start = dayjs().startOf("month");
  const end = start.clone().add(1, "month").endOf("D");
  return [start.toDate(), end.toDate()];
};

export const phoneNumberFormatter = (phoneNumber: string) => {
  if (!phoneNumber) return "-";

  const cleaned = phoneNumber.replace(/[^\d+]/g, "");

  if (cleaned.length < 10) return phoneNumber;

  let numberToFormat = cleaned;
  if (cleaned.startsWith("+1") && cleaned.length >= 12) {
    numberToFormat = cleaned.slice(2);
  } else if (cleaned.startsWith("1") && cleaned.length >= 11) {
    numberToFormat = cleaned.slice(1);
  }

  if (numberToFormat.length < 10) return phoneNumber;

  return `+1 (${numberToFormat.slice(0, 3)}) ${numberToFormat.slice(
    3,
    6,
  )} - ${numberToFormat.slice(6, 10)}`;
};
