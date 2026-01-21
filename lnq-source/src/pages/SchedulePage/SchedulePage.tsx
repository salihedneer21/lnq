import { useState } from "react";
import { EventsCalendar } from "../../components/EventsCalendar/EventsCalendar";
import { getDefaultRange } from "../../components/EventsCalendar/utils";
import {
  useGetGroup,
  useGetMyGroups,
  useGetProvidersInGroupUsingIntegration,
} from "../../api/GroupApi";
import { Box, Text, VStack } from "@chakra-ui/react";
import { useParams } from "react-router-dom";

export const SchedulePage: React.FC = () => {
  const params = useParams<{ groupId: string }>();
  const { data } = useGetMyGroups(0, 1);
  const { data: getGroupData } = useGetGroup(params.groupId);
  const groupToFetchScheduleFrom = params.groupId?.trim()
    ? getGroupData?.group
    : data?.docs?.[0];

  const [range, setRange] = useState(getDefaultRange());
  const handleSetRange = (range: [Date, Date]) => {
    setRange(range);
  };
  const { data: groupWithProviders } = useGetProvidersInGroupUsingIntegration(
    groupToFetchScheduleFrom?.id,
    1,
    0,
    {
      mode: "group-schedule",
      startDate: range[0].toISOString(),
      endDate: range[1].toISOString(),
    },
  );
  return (
    <VStack alignItems="flex-start">
      <Box>
        <Text textStyle="h4" textAlign="left">
          Viewing {groupToFetchScheduleFrom?.facilityName} schedule
        </Text>
      </Box>
      <EventsCalendar
        onDateRangeChanged={handleSetRange}
        range={range as [Date, Date]}
        groupProviders={groupWithProviders?.providers ?? []}
      />
    </VStack>
  );
};
