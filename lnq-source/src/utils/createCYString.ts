import { CodeYellow } from "../types/CodeYellow";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const createCYString = (
  cy: Pick<
    CodeYellow,
    | "id"
    | "startTime"
    | "endTime"
    | "isActive"
    | "distributionType"
    | "usdPerRvu"
    | "activatingProvider"
    | "group"
  >,
  groupName: string,
) => {
  const activatorName = cy.activatingProvider
    ? `${cy.activatingProvider.lastName} ${cy.activatingProvider.firstName}`
    : null;
  return `${activatorName ? `${activatorName} ` : ""}${groupName} - $${
    cy.usdPerRvu
  } - ${dayjs(cy.startTime).format("MM/DD/YYYY h:mma")} - ${
    cy.endTime ? dayjs(cy.endTime).format("MM/DD/YYYY h:mma") : "N/A"
  }`;
};
