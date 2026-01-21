import { useCallback, useState } from "react";
import { useUserTimezoneSettings } from "../../hooks/useUserTimezone";
import { useDateRange } from "../../hooks/useDates";
import dayjs from "dayjs";

export type ViewType = "day" | "month" | "week";
interface Props {
  range: [Date, Date];
  onDateRangeChanged: (range: [Date, Date]) => void;
}
export const useCalendar = ({ range, onDateRangeChanged }: Props) => {
  const [viewType, setViewType] = useState<ViewType>("month");
  const userTimezoneSettings = useUserTimezoneSettings();
  const { days } = useDateRange({ startDate: range[0], endDate: range[1] });

  const handleSetPrevious = () => {
    const start = dayjs(range[0]).subtract(1, viewType).startOf(viewType);
    const end = start.clone().add(1, viewType);
    onDateRangeChanged([start.toDate(), end.toDate()]);
  };
  const handleSetToday = () => {
    const start = dayjs(new Date()).startOf("day");
    const end = dayjs(start).add(1, "day");

    onDateRangeChanged([start.toDate(), end.toDate()]);
  };
  const handleSetNext = () => {
    const start = dayjs(range[0]).startOf(viewType).add(1, viewType);
    const end = start.clone().add(1, viewType);
    onDateRangeChanged([start.toDate(), end.toDate()]);
  };

  const handleRearrangeBasedOnView = useCallback(
    (newViewType: ViewType) => () => {
      switch (newViewType) {
        case "month": {
          const start = dayjs().startOf("month");
          const end = start.clone().add(1, "month").endOf("D");

          onDateRangeChanged([start.toDate(), end.toDate()]);
          setViewType("month");
          break;
        }
        case "week": {
          const start = dayjs().startOf("week");
          const end = start.clone().add(1, "week").endOf("D");

          onDateRangeChanged([start.toDate(), end.toDate()]);
          setViewType("week");
          break;
        }
        case "day": {
          const start = dayjs().startOf("day");
          const end = start.clone().add(1, "day");

          onDateRangeChanged([start.toDate(), end.toDate()]);
          setViewType("day");

          break;
        }
      }
    },
    [onDateRangeChanged],
  );

  return {
    days,
    onNext: handleSetNext,
    onPrevious: handleSetPrevious,
    onToday: handleSetToday,
    onDayView: handleRearrangeBasedOnView("day"),
    onViewWeek: handleRearrangeBasedOnView("week"),
    onViewMonth: handleRearrangeBasedOnView("month"),
    isDay: viewType === "day",
    isWeek: viewType === "week",
    isMonth: viewType === "month",
    viewType,
    userTimezoneSettings,
  };
};
