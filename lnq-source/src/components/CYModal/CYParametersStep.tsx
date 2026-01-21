import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import {
  FormControl,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";

import { Group } from "../../types/Group.ts";
import { timeZoneFullNames } from "../../utils/timeZones.ts";
import DateRangePicker from "../DateRangePicker/DateRangePicker";
import { TimePicker } from "../TimePicker/TimePicker";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CYParametersStepProps {
  dateRangeDidChange: Dispatch<SetStateAction<{ start: string; end?: string } | undefined>>;
  initialDateRange?: { start: string; end?: string };
  group?: Group;
}

interface ConstructData {
  cyActivation: string;
  endTime: string | null;
  endDate: Date | null;
  laterStartDate: Date | null;
  laterEndDate: Date | null;
  laterStartTime: string | null;
  laterEndTime: string | null;
}

enum CYActivation {
  now = "now",
  later = "later",
}

const combineDateAndTime = (date: Date, time: string): string => {
  const [hoursStr, minutesStr] = time.split(":");
  const [minutes, ampm] = minutesStr.split(" ");
  let hours = Number.parseInt(hoursStr, 10);
  if (ampm.toLowerCase() === "pm" && hours !== 12) hours += 12;
  if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;
  const dateTime = new Date(date);
  dateTime.setHours(hours, Number.parseInt(minutes, 10), 0, 0);
  return dayjs(dateTime).format();
};

const constructDateRange = ({
  cyActivation,
  endTime,
  endDate,
  laterEndDate,
  laterEndTime,
  laterStartDate,
  laterStartTime,
}: ConstructData) => {
  if (cyActivation === CYActivation.now.toString()) {
    const now = new Date();
    let end: string | undefined;
    if (endDate && endTime) {
      const [hoursStr, minutesStr] = endTime.split(":");
      const [minutes, ampm] = minutesStr.split(" ");
      let hours = Number.parseInt(hoursStr, 10);
      if (ampm.toLowerCase() === "pm" && hours !== 12) hours += 12;
      if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;
      const endDateTime = new Date(endDate);
      endDateTime.setHours(hours, Number.parseInt(minutes, 10), 0, 0);
      end = dayjs(endDateTime).format();
    }
    return {
      start: dayjs(now).format(),
      end,
    };
  } else {
    if (!laterStartDate || !laterEndDate || !laterStartTime || !laterEndTime) {
      return undefined;
    }
    const start = combineDateAndTime(laterStartDate, laterStartTime);
    const end = combineDateAndTime(laterEndDate, laterEndTime);
    return { start, end };
  }
};

const filterEndTimesForActiveNow = (endDate: Date | null, time: string) => {
  if (!endDate) return true;
  const now = new Date();
  const [hours, minutes] = time.split(":");
  const [minutesPart, ampm] = minutes.split(" ");
  let hour = Number.parseInt(hours, 10);
  if (ampm.toLowerCase() === "pm" && hour !== 12) hour += 12;
  if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;
  const timeDate = new Date(endDate);
  timeDate.setHours(hour, Number.parseInt(minutesPart, 10), 0, 0);
  return timeDate > now;
};

const CYParametersStep: React.FC<CYParametersStepProps> = ({
  dateRangeDidChange,
  initialDateRange,
  group,
}) => {
  const [cyActivation, setCyActivation] = useState<string>(
    initialDateRange?.start && initialDateRange?.end
      ? CYActivation.later.toString()
      : CYActivation.now.toString(),
  );

  // Active now states
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  // Active later states
  const [laterStartDate, setLaterStartDate] = useState<Date | null>(
    initialDateRange?.start ? new Date(initialDateRange.start) : null,
  );
  const [laterStartTime, setLaterStartTime] = useState<string | null>(
    initialDateRange?.start ? dayjs(initialDateRange.start).format("hh:mm A") : null,
  );
  const [laterEndDate, setLaterEndDate] = useState<Date | null>(
    initialDateRange?.end ? new Date(initialDateRange.end) : null,
  );
  const [laterEndTime, setLaterEndTime] = useState<string | null>(
    initialDateRange?.end ? dayjs(initialDateRange.end).format("hh:mm A") : null,
  );

  const isStartAfterEnd = useCallback(() => {
    if (cyActivation === CYActivation.later.toString()) {
      if (!laterStartDate || !laterEndDate || !laterStartTime || !laterEndTime) {
        return false;
      }

      const startDateTime = combineDateAndTime(laterStartDate, laterStartTime);
      const endDateTime = combineDateAndTime(laterEndDate, laterEndTime);

      return dayjs(startDateTime).isAfter(dayjs(endDateTime));
    }
    return false;
  }, [cyActivation, laterStartDate, laterEndDate, laterStartTime, laterEndTime]);

  const filterStartTimes = useCallback(
    (time: string) => {
      if (!laterEndDate || !laterEndTime || !laterStartDate) return true;

      if (laterStartDate.toDateString() !== laterEndDate.toDateString()) return true;

      const startTime = parseTime(time);
      const endTime = parseTime(laterEndTime);

      return startTime < endTime;
    },
    [laterStartDate, laterEndDate, laterEndTime],
  );

  const filterEndTimes = useCallback(
    (time: string) => {
      if (!laterStartDate || !laterStartTime || !laterEndDate) return true;

      if (laterStartDate.toDateString() !== laterEndDate.toDateString()) return true;

      const endTime = parseTime(time);
      const startTime = parseTime(laterStartTime);

      return endTime > startTime;
    },
    [laterStartDate, laterEndDate, laterStartTime],
  );

  const parseTime = (timeStr: string): Date => {
    const [time, ampm] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    const adjustedHours = (() => {
      const ampmLower = ampm.toLowerCase();
      if (ampmLower === "pm" && hours !== 12) return hours + 12;
      if (ampmLower === "am" && hours === 12) return 0;
      return hours;
    })();

    date.setHours(adjustedHours, minutes, 0, 0);
    return date;
  };

  useEffect(() => {
    const constructedDateRange = constructDateRange({
      cyActivation,
      endDate,
      endTime,
      laterStartDate,
      laterStartTime,
      laterEndDate,
      laterEndTime,
    });

    if (isStartAfterEnd()) {
      dateRangeDidChange(undefined);
    } else {
      dateRangeDidChange(constructedDateRange);
    }
  }, [
    cyActivation,
    dateRangeDidChange,
    endDate,
    endTime,
    laterEndDate,
    laterEndTime,
    laterStartDate,
    laterStartTime,
    isStartAfterEnd,
  ]);

  const getFilterTimes = useCallback(
    (time: string) => filterEndTimesForActiveNow(endDate, time),
    [endDate],
  );
  return (
    <>
      <Text textStyle="bodyBold" fontSize={18} color="white" textAlign="left" mb="8" ml={1}>
        LnQ Parameters
      </Text>
      <Text color="lightgray" fontSize={16} mb={8}>
        Set up an alert for this code. <br /> The default time zone for this group is{" "}
        {group?.timeZone ? timeZoneFullNames[group.timeZone] : "unknown"}.
      </Text>
      <RadioGroup onChange={setCyActivation} value={cyActivation} colorScheme="brandYellow">
        <Stack
          justifyItems="flex-start"
          alignItems="left"
          direction="column"
          textColor="white"
          fontWeight="600"
          fontSize="16px"
          maxH="360px"
          px={0}
          pb={4}
          spacing="32px"
        >
          {/* Active Now Section */}
          <VStack align="left" spacing="12px">
            <Radio value={CYActivation.now}>Active now</Radio>
            <FormControl>
              <VStack spacing="12px" align="left">
                <Text color="lightgray" fontSize={14}>
                  End Time
                </Text>
                <HStack spacing="9px">
                  <DateRangePicker
                    buttonStyle={{ minW: "fit-content", h: "56px" }}
                    variant="single"
                    onDatesChange={(dates) => dates.length > 0 && setEndDate(dates[0])}
                    isDisabled={cyActivation !== CYActivation.now.toString()}
                    isDateSelectable={(date) =>
                      date.getTime() >= new Date().setHours(0, 0, 0, 0)
                    }
                    initialDates={endDate ? [endDate] : undefined}
                    usePortal={false}
                  />
                  <TimePicker
                    selectedTime={endTime ?? "End Time"}
                    setSelectedTime={setEndTime}
                    isDisabled={cyActivation !== CYActivation.now.toString() || !endDate}
                    filterTimes={getFilterTimes}
                    currentDate={endDate!}
                  />
                </HStack>
              </VStack>
            </FormControl>
          </VStack>

          {/* Active Later Section */}
          <VStack align="left" spacing="12px" w="400px">
            <Radio value={CYActivation.later}>Active later</Radio>
            <FormControl>
              <VStack spacing="12px" align="left">
                <Text color="lightgray" fontSize={14}>
                  Start Time
                </Text>
                <HStack spacing="9px">
                  <DateRangePicker
                    buttonStyle={{ minW: "fit-content", h: "56px" }}
                    variant="single"
                    onDatesChange={(dates) =>
                      dates.length > 0 && setLaterStartDate(dates[0])
                    }
                    isDisabled={cyActivation !== CYActivation.later.toString()}
                    isDateSelectable={(date) => {
                      const today = new Date().setHours(0, 0, 0, 0);
                      const isAfterToday = date.getTime() >= today;

                      // If end date is selected, start date should not be after end date
                      if (laterEndDate) {
                        const endDateMidnight = new Date(laterEndDate).setHours(0, 0, 0, 0);
                        return isAfterToday && date.getTime() <= endDateMidnight;
                      }

                      return isAfterToday;
                    }}
                    initialDates={laterStartDate ? [laterStartDate] : undefined}
                    usePortal={false}
                  />
                  <TimePicker
                    selectedTime={laterStartTime ?? "Start Time"}
                    setSelectedTime={setLaterStartTime}
                    isDisabled={
                      cyActivation !== CYActivation.later.toString() || !laterStartDate
                    }
                    filterTimes={filterStartTimes}
                    currentDate={laterStartDate!}
                  />
                </HStack>
                <Text color="lightgray" fontSize={14}>
                  End Time
                </Text>
                <HStack spacing="9px">
                  <DateRangePicker
                    buttonStyle={{ minW: "fit-content", h: "56px" }}
                    variant="single"
                    onDatesChange={(dates) => dates.length > 0 && setLaterEndDate(dates[0])}
                    isDisabled={cyActivation !== CYActivation.later.toString()}
                    isDateSelectable={(date) =>
                      date.getTime() >= (laterStartDate?.getTime() ?? Date.now())
                    }
                    initialDates={laterEndDate ? [laterEndDate] : undefined}
                    usePortal={false}
                  />
                  <TimePicker
                    selectedTime={laterEndTime ?? "End Time"}
                    setSelectedTime={setLaterEndTime}
                    isDisabled={
                      cyActivation !== CYActivation.later.toString() || !laterEndDate
                    }
                    filterTimes={filterEndTimes}
                    currentDate={laterEndDate!}
                  />
                </HStack>
              </VStack>
            </FormControl>
          </VStack>
        </Stack>
      </RadioGroup>
    </>
  );
};

export default CYParametersStep;
