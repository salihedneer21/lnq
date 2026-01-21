import React, { useMemo } from "react";
import { Badge, Td, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { AdminCompletedStudy } from "~types/AdminCompletedStudy";
import { createCYString } from "~utils/createCYString";

import ActiveAlertsPopover from "../ActiveAlertsPopover";
import AdminCompletedStudyActionMenu from "./AdminCompletedStudyActionMenu";

dayjs.extend(utc);

interface Props {
  study: AdminCompletedStudy;
  groupName: string;
  onMarkAsPaid: (studyId: string) => void;
}

const AdminCompletedStudyRow: React.FC<Props> = ({ study, groupName, onMarkAsPaid }) => {
  const highestPayingCY = useMemo(() => {
    if (study.prevailingCodeYellow) {
      return study.prevailingCodeYellow;
    }
    if (study.activeAlerts && study.activeAlerts.length > 0) {
      return study.activeAlerts.reduce(
        (max, cy) => (max.usdPerRvu * 1 > cy.usdPerRvu * 1 ? max : cy),
        study.activeAlerts[0],
      );
    }
    return null;
  }, [study.prevailingCodeYellow, study.activeAlerts]);
  const otherCYs = useMemo(
    () => study.activeAlerts?.filter((cy) => cy.id !== highestPayingCY?.id) ?? [],
    [highestPayingCY?.id, study.activeAlerts],
  );
  const highestPayingActiveAlertString = useMemo(
    () => `${highestPayingCY ? `*${createCYString(highestPayingCY, groupName)}` : ""}`,
    [groupName, highestPayingCY],
  );
  const otherActiveAlertsString = useMemo(
    () =>
      `${
        otherCYs.length > 0
          ? otherCYs.reduce(
              (prev, cy, index, array) =>
                `${prev}• ${createCYString(cy, groupName)}${
                  index === array.length - 1 ? "" : "\n\n"
                }`,
              "",
            )
          : ""
      }`,
    [groupName, otherCYs],
  );

  const getPaymentStatusBadge = (status: string) => {
    const colorScheme =
      {
        PAID: "green",
        PAYABLE: "blue",
        PENDING: "yellow",
        NONPAYABLE: "red",
      }[status] ?? "gray";

    return (
      <Badge colorScheme={colorScheme} variant="solid">
        {status}
      </Badge>
    );
  };

  return (
    <>
      <Td>
        <Text textStyle={"sm"}>{study.orderCode}</Text>
      </Td>
      <Td>
        <Text textStyle={"sm"}>
          {study.orderDescription && study.orderDescription.length > 0
            ? study.orderDescription
            : "-"}
        </Text>
      </Td>
      <Td>
        <Text textStyle={"sm"}>
          {study.cptCodes && study.cptCodes.length > 0 ? study.cptCodes.join(", ") : "-"}
        </Text>
      </Td>
      <Td>
        <Text textStyle={"sm"}>
          {study.readingProvider && study.readingProvider.length > 0
            ? study.readingProvider
            : "-"}
        </Text>
      </Td>
      <Td>
        <Text textStyle={"sm"}>
          {study.radiologistId && study.radiologistId.length > 0
            ? study.radiologistId
            : "-"}
        </Text>
      </Td>
      <Td>
        <Text textStyle={"sm"}>{study.rvu?.toFixed(2)}</Text>
      </Td>
      <Td>
        <ActiveAlertsPopover
          highestPayingActiveAlertString={highestPayingActiveAlertString}
          otherActiveAlertsString={otherActiveAlertsString}
        />
      </Td>
      <Td>
        <Text textStyle={"sm"}>{study.payable ? "Yes" : "No"}</Text>
      </Td>
      <Td>
        <Text textStyle={"sm"}>{study.prevailingUsdPerRvu?.toFixed(2)}</Text>
      </Td>
      <Td>
        <Text textStyle={"sm"}>{study.prevailingDollarsPayable?.toFixed(2)}</Text>
      </Td>
      <Td>
        <Text textStyle={"sm"}>
          {dayjs(study.dateFinalized).format("MM/DD/YYYY, h:mma")}
        </Text>
      </Td>
      <Td>{getPaymentStatusBadge(study.paymentStatus)}</Td>
      <Td>
        <Text mr={4} textStyle={"sm"}>
          {study.paymentStatusReason ?? "-"}
        </Text>
      </Td>
      <Td>
        <Text mr={4} textStyle={"sm"}>
          {study.compensationSource ?? "-"}
        </Text>
      </Td>
      <Td>
        <Text mr={4} textStyle="sm">
          {study.originalFacility ?? "-"}
        </Text>
      </Td>
      <Td>
        <Text mr={4} textStyle="sm">
          {study.paidOverTarget ? "Yes" : "No"}
        </Text>
      </Td>
      <Td>
        <AdminCompletedStudyActionMenu study={study} onMarkAsPaid={onMarkAsPaid} />
      </Td>
    </>
  );
};
export default AdminCompletedStudyRow;
