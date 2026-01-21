import dayjs from "dayjs";
import { Badge, HStack, Td, Text, Tr } from "@chakra-ui/react";

import { DistributionType, LnqRepeat, LnqRepeatStatus } from "../../types/CodeYellow";
import { getShortAbbreviationOfTimezone } from "../../utils/dateFormatters";
import { formatDateWithOrdinal } from "../../utils/dateUtils";
import { formatUSD } from "../../utils/formatUtils";
import { getRecurrenceDisplayText } from "../../utils/recurrenceUtils";
import { getStatusColorScheme } from "../../utils/statusUtils";
import { getUserTimeZone } from "../../utils/timeZones";

import RepeatingLnQRowMenu from "./RepeatingLnQRowMenu";

interface RepeatingLnQRowProps {
  lnqRepeat: LnqRepeat;
}

const getRecurrenceText = (lnqRepeat: LnqRepeat) => {
  if (!lnqRepeat.repeat) {
    return "-";
  }

  // If recurrence is "Yearly", convert it to "Yearly on" + current date
  if (lnqRepeat.recurrence === "Yearly") {
    const currentDate = new Date();
    return `Yearly on ${formatDateWithOrdinal(currentDate)}`;
  }

  // If recurrence is already set and it's not "Yearly", use it directly
  if (lnqRepeat.recurrence && lnqRepeat.recurrence !== "Yearly") {
    return lnqRepeat.recurrence;
  }

  return getRecurrenceDisplayText(lnqRepeat.repeat);
};

const RepeatingLnQRow: React.FC<RepeatingLnQRowProps> = ({ lnqRepeat }) => {
  const isActive =
    lnqRepeat.status === LnqRepeatStatus.STARTING_SOON &&
    lnqRepeat.startTime &&
    dayjs(lnqRepeat.startTime).isBefore(dayjs());

  const displayLnQRepeatStatus: LnqRepeatStatus = isActive
    ? LnqRepeatStatus.ACTIVE
    : lnqRepeat.status;

  const { textColor, bgColor } = getStatusColorScheme(displayLnQRepeatStatus);

  const userTimeZone = getUserTimeZone();
  const userTimeZoneAbbreviation = getShortAbbreviationOfTimezone(userTimeZone);

  return (
    <Tr backgroundColor="darkBlue2.900" height="50px">
      <Td>
        <Text textStyle={"smMdSemi"}>
          {lnqRepeat.name || lnqRepeat.group?.facilityName || "Unnamed LnQ"}
        </Text>
      </Td>
      <Td>
        <Text textStyle={"smBold"}>
          {lnqRepeat.startTime
            ? dayjs(lnqRepeat.startTime).format("MM/DD/YYYY HH:mm") +
              ` (${userTimeZoneAbbreviation})`
            : "-"}
        </Text>
      </Td>
      <Td>
        <Text textStyle={"smBold"}>
          {lnqRepeat.endTime
            ? dayjs(lnqRepeat.endTime).format("MM/DD/YYYY HH:mm") +
              ` (${userTimeZoneAbbreviation})`
            : "-"}
        </Text>
      </Td>
      <Td>
        <Text textStyle={"smBold"}>{lnqRepeat.activatingProviderName ?? "N/A"}</Text>
      </Td>
      <Td>
        <Text color="#FCB74F" textStyle={"smBold"}>
          {lnqRepeat.distributionType == DistributionType.TARGET &&
          lnqRepeat.targetedProvidersCount
            ? lnqRepeat.targetedProvidersCount
            : lnqRepeat.groupProvidersCount}
        </Text>
      </Td>
      <Td>
        <Text textStyle={"smBold"}>{formatUSD(lnqRepeat.usdPerRvu)}</Text>
      </Td>
      <Td>
        <Badge
          bg="#FFFFFF33"
          color="white"
          py={1}
          px={3}
          borderRadius="full"
          textTransform="capitalize"
          fontWeight="bold"
        >
          {getRecurrenceText(lnqRepeat)}
        </Badge>
      </Td>
      <Td>
        <Badge
          bg={bgColor}
          color={textColor}
          py={1}
          px={3}
          borderRadius="full"
          textTransform="capitalize"
          fontWeight="bold"
        >
          {displayLnQRepeatStatus}
        </Badge>
      </Td>
      <Td>
        <Text textStyle={"smBold"}>
          {lnqRepeat.endDate ? dayjs(lnqRepeat.endDate).format("MM/DD/YYYY") : "-"}
        </Text>
      </Td>
      <Td>
        <HStack spacing={2} justify="flex-end">
          <RepeatingLnQRowMenu lnqRepeat={lnqRepeat} />
        </HStack>
      </Td>
    </Tr>
  );
};

export default RepeatingLnQRow;
