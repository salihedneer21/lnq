import { Dayjs } from "dayjs";
import { THEME_COLORS } from "../../base/theme/foundations/colors";

const weekendDays = [0, 6];

export const EventsCalendarColSettings: React.FC<{ days: Dayjs[] }> = ({ days }) => (
  <colgroup>
    <col span={1} style={{ width: "6rem" }}></col>

    {days.map((day, index) => {
      const isWeekend = weekendDays.includes(day.day());
      return (
        <col
          span={1}
          style={{
            minWidth: "6rem",
            backgroundColor: isWeekend ? THEME_COLORS.brandBlue[800] : undefined,
          }}
          key={index}
        ></col>
      );
    })}
  </colgroup>
);
