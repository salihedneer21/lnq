export const getOrdinal = (n: number): string => {
  if (n > 3 && n < 21) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};

export const formatUSD = (amount: number): string => {
  return `$${Number(amount).toFixed(2)}`;
};

export const formatNumber = (
  value: number | string | undefined | null,
  decimals = 2,
): string => {
  if (value === undefined || value === null) return "-";
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(numValue)) return "-";
  return numValue.toFixed(decimals);
};

export const getInitials = (name: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
