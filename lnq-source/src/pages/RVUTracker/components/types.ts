export interface Shift {
  id: string;
  name: string;
  totalRVUs: number;
  rvuTarget: number;
  lnqRVUs: number;
  totalStudies: number;
  percentOfTarget: number;
}

export interface ProgressBarSection {
  value: number;
  percentage: number;
  color: string;
  label: string;
}

export const COLORS = {
  lnqRVUs: "#F7E376",
  rvus: "#FF9760",
  studies: "#91B6FE",
  background: "#0f172a",
  primaryBg: "#20213C",
  success: "#22c55e",
  error: "#ef4444",
  gray: "#A1A1AA",
} as const;
