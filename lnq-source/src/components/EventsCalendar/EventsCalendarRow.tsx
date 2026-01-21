import { Tag, Td, Text, Tr, VStack } from "@chakra-ui/react";
import dayjs, { Dayjs } from "dayjs";

import { THEME_COLORS } from "~base/theme/foundations/colors";
import { useUserTimezoneSettings } from "~hooks/useUserTimezone";
import { GroupProviderWithQGendaIntegration } from "~types/Group";

export const EventsCalendarRow: React.FC<{
  provider: GroupProviderWithQGendaIntegration;
  days: Dayjs[];
  userTimezoneSettings: ReturnType<typeof useUserTimezoneSettings>;
}> = ({ provider, days, userTimezoneSettings }) => {
  const { id: providerId, user, integration } = provider;
  const { userTimezone, userTimezoneAbbreviation } = userTimezoneSettings;
  const schedules = integration?.data?.providerSchedules ?? [];

  return (
    <Tr key={providerId} borderBottom={0}>
      <Td
        borderBottom={0}
        position={"sticky"}
        left={0}
        style={{
          backgroundColor: THEME_COLORS.darkBlue[900],
          borderRadius: 0,
        }}
      >
        {user.lastName} <br />
        {user.firstName}
      </Td>
      {days.map((day) => {
        const schedulesOnThisDay = schedules.filter(
          (schedule) =>
            day.format("YYYY-MM-DD") ===
            dayjs
              .tz(schedule.scheduleStartDate, userTimezoneSettings.userTimezone)
              .format("YYYY-MM-DD"),
        );
        return (
          <Td
            key={`${providerId}-${day.toISOString()}`}
            borderLeft="1px"
            borderLeftColor="gray.600"
            borderBottom={0}
            borderRadius="0!important"
            textAlign="left"
          >
            <VStack alignItems="flex-start">
              {schedulesOnThisDay.map((schedule, index) => {
                const {
                  scheduleStartDateUTC,
                  scheduleEndDateUTC,
                  taskAbbrev,
                  scheduleStartTime,
                  mode,
                } = schedule;

                const startTime = scheduleStartDateUTC
                  ? dayjs(scheduleStartDateUTC).tz(userTimezone).format("HH:mm")
                  : null;

                const endTime = scheduleEndDateUTC
                  ? dayjs(scheduleEndDateUTC).tz(userTimezone).format("HH:mm")
                  : null;

                return (
                  <Tag
                    textStyle="sm"
                    size="sm"
                    p="1"
                    fontSize="0.5rem"
                    minH="8"
                    w="100%"
                    key={`${providerId}-${scheduleStartTime}-${index}`}
                    whiteSpace={"nowrap"}
                  >
                    <Text fontWeight="900"> {taskAbbrev}</Text>
                    {mode === "ON" ? (
                      <>
                        &nbsp; - &nbsp;
                        <Text color="inherit" whiteSpace="nowrap">
                          {startTime}
                          <br />
                          {endTime}
                          &nbsp;({userTimezoneAbbreviation})
                        </Text>
                      </>
                    ) : null}
                  </Tag>
                );
              })}
            </VStack>
          </Td>
        );
      })}
    </Tr>
  );
};
