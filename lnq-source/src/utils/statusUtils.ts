import { LnqRepeat } from "../types/CodeYellow";

export const getStatusColorScheme = (status: LnqRepeat["status"]) => {
  switch (status) {
    case "Active":
      return { textColor: "#69CE53", bgColor: "#69CE5333" };
    case "Starting Soon":
      return { textColor: "#5BC0EB", bgColor: "#5BC0EB33" };
    case "Deactivated":
      return { textColor: "#FCDE1A", bgColor: "#FCDE1A33" };
    case "Ended":
      return { textColor: "#DC2626", bgColor: "#FF000033" };
    case "Ending Soon":
      return { textColor: "#F59E0B", bgColor: "#F59E0B33" };
    case "Scheduled":
      return { textColor: "#8B5CF6", bgColor: "#8B5CF633" };
    default:
      return { textColor: "#FFFFFF", bgColor: "#FFFFFF33" };
  }
};

export const getProviderName = (lnqRepeat: LnqRepeat): string => {
  if (lnqRepeat.activatingProvider) {
    return `${lnqRepeat.activatingProvider.firstName} ${lnqRepeat.activatingProvider.lastName}`;
  } else if (lnqRepeat.worklist?.user) {
    return `${lnqRepeat.worklist.user.firstName} ${lnqRepeat.worklist.user.lastName}`;
  }

  return "N/A";
};
