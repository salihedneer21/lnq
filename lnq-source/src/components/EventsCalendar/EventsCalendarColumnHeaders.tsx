import { Th, Thead, Tr } from "@chakra-ui/react";
import { Dayjs } from "dayjs";

import { THEME_COLORS } from "../../base/theme/foundations/colors";

export const EventsCalendarColumnHeaders: React.FC<{ days: Dayjs[] }> = ({ days }) => (
  <Thead>
    <Tr>
      <Th borderBottom={0}></Th>
      {days.map((date, index) => {
        return (
          <Th
            borderBottom={0}
            key={`${date.valueOf()}-${index}`}
            data-testid="calendar-weekdays"
            color={THEME_COLORS.primary[50]}
            textAlign={"center"}
          >
            {date.format("DD ddd")}
          </Th>
        );
      })}
    </Tr>
  </Thead>
);
