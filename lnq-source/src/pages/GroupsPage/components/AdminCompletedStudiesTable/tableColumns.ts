import { HeaderCell } from "./HeaderCell";

export const tableColumns: HeaderCell[] = [
  { key: "orderCode", label: "Facility Code" },
  { key: "orderDescription", label: "Order Description" },
  { key: "cptCodes", label: "CPT Code" },
  { key: "readingProvider", label: "Reading Provider" },
  { key: "radiologistId", label: "Provider ID" },
  { key: "rvu", label: "RVU" },
  { key: "activeAlerts", label: "Active Alerts" },
  { key: "payable", label: "Payable" },
  { key: "prevailingUsdPerRvu", label: "Rate/RVU" },
  { key: "prevailingDollarsPayable", label: "Prevailing Dollars Payable" },
  { key: "dateFinalized", label: "Date Finalized" },
  { key: "paymentStatus", label: "Payment Status" },
  { key: "paymentStatusReason", label: "Status Reason" },
  { key: "compensationSource", label: "Compensation Source" },
  { key: "originalFacility", label: "Facility" },
  { key: "paidOverTarget", label: "Payable Over Target" },
  { key: "id", label: "Actions" },
];
