import { Box, Table, TableContainer, Tbody } from "@chakra-ui/react";

import { THEME_COLORS } from "~base/theme/foundations/colors";
import { GroupProviderWithQGendaIntegration } from "~types/Group";

import { EventsCalendarCaption } from "./EventsCalendarCaption";
import { EventsCalendarColSettings } from "./EventsCalendarColSettings";
import { EventsCalendarColumnHeaders } from "./EventsCalendarColumnHeaders";
import { EventsCalendarNavigation } from "./EventsCalendarNavigation";
import { EventsCalendarRow } from "./EventsCalendarRow";
import { useCalendar } from "./useCalendar";

export const EventsCalendar: React.FC<{
  range: [Date, Date];
  onDateRangeChanged: (range: [Date, Date]) => void;
  groupProviders: GroupProviderWithQGendaIntegration[];
}> = ({ range, onDateRangeChanged, groupProviders }) => {
  const { viewType, days, userTimezoneSettings, ...rest } = useCalendar({
    range,
    onDateRangeChanged,
  });
  return (
    <Box w="100%" mt="4" overflowY="unset">
      <EventsCalendarNavigation {...rest} />
      <TableContainer
        height="calc(100vh - 276px)"
        overflowX="unset"
        overflowY="auto"
        bgColor={THEME_COLORS.darkBlue2[900]}
      >
        <Table
          variant="simple"
          size="sm"
          sx={{
            borderCollapse: "collapse!important",
            thead: {
              position: "sticky",
              top: "35px",
              zIndex: "docked",
              backgroundColor: THEME_COLORS.darkBlue[900],
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
            tbody: {
              marginTop: "40px",
            },
          }}
        >
          <EventsCalendarColSettings days={days} />
          <EventsCalendarCaption days={days} viewType={viewType} />
          <EventsCalendarColumnHeaders days={days} />
          <Tbody>
            {(groupProviders ?? []).map((provider) => (
              <EventsCalendarRow
                key={provider.id}
                provider={provider}
                days={days}
                userTimezoneSettings={userTimezoneSettings}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
