import { Box, TableCaption, Text } from "@chakra-ui/react";
import { Dayjs } from "dayjs";

import { THEME_COLORS } from "~base/theme/foundations/colors";

import { ViewType } from "./useCalendar";

interface EventsCalendarCaptionProps {
  days: Dayjs[];
  viewType: ViewType;
}

export const EventsCalendarCaption: React.FC<EventsCalendarCaptionProps> = ({
  days,
  viewType,
}) => {
  const startDay = days[0];
  const endDay = days[days.length - 1];
  const isWeekView = viewType === "week";

  return (
    <TableCaption
      placement="top"
      textAlign="left"
      sx={{
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: "docked",
        backgroundColor: THEME_COLORS.darkBlue[900],
        mt: 0,
        padding: "0.5rem 0",
        borderBottom: "1px solid",
        borderColor: THEME_COLORS.darkBlue[800],
      }}
    >
      <Box color="gray.300" sx={{ position: "sticky", left: 0, display: "inline-block" }}>
        Schedule for{" "}
        <Text as="span" textStyle="smBold">
          {startDay.format("MMMM")}
        </Text>
        {isWeekView && (
          <Text textStyle="smMdSemi" fontSize="xx-small" mt={1}>
            {startDay.format("DD ddd")} to {endDay.format("DD ddd")}
          </Text>
        )}
      </Box>
    </TableCaption>
  );
};
