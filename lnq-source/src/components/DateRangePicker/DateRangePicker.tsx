import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverTrigger,
  Box,
  IconButton,
  Text,
  PopoverFooter,
  LayoutProps,
  Portal,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import Dayzed from "dayzed";
import dayjs from "dayjs";

interface Props {
  onDatesChange: (dates: Date[]) => void;
  variant?: "single" | "range";
  buttonStyle?: LayoutProps;
  initialDates?: Date[];
  disableClear?: boolean;
  isDisabled?: boolean;
  isDateSelectable?: (date: Date) => boolean;
  leftIcon?: React.ReactElement<any, any>;
  rightIcon?: React.ReactElement<any, any>;
  size?: "sm" | "md" | "lg" | "custom";
  w?: string | number;
  usePortal?: boolean;
  portalZIndex?: number;
}

const DateRangePicker: React.FC<Props> = ({
  onDatesChange,
  variant = "range",
  buttonStyle,
  initialDates,
  disableClear = false,
  isDisabled = false,
  isDateSelectable,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  size = "md",
  w,
  usePortal = true,
  portalZIndex = 3000,
}) => {
  const [dates, setDates] = useState<Date[]>(initialDates ?? []);
  const numberOfDates = useMemo(() => (variant === "range" ? 2 : 1), [variant]);
  const title = useMemo(
    () => (variant === "range" ? "Select Date Range" : "Select Date"),
    [variant],
  );

  // Define size mappings
  const sizeStyles = useMemo(() => {
    const sizes = {
      sm: { minH: "32px", minW: "180px", fontSize: "sm" },
      md: { minH: "56px", minW: "231px", fontSize: "md" },
      lg: { minH: "64px", minW: "280px", fontSize: "lg" },
      custom: { minH: "32px", minW: "180px", fontSize: "sm" },
    };
    return sizes[size];
  }, [size]);

  const buttonStyleProps = useMemo(() => {
    const base: Record<string, any> = { ...sizeStyles };
    if (buttonStyle) Object.assign(base, buttonStyle);
    if (w) base.w = w;
    return base;
  }, [buttonStyle, sizeStyles, w]);

  const selectedDateString = useMemo(() => {
    if (dates.length === 0) {
      return title;
    } else if (dates.length === 1) {
      return dayjs(dates[0]).format("MM/DD/YYYY");
    } else if (dates.length === 2) {
      return `${dayjs(dates[0]).format("MM/DD/YYYY")} - ${dayjs(dates[1]).format(
        "MM/DD/YYYY",
      )}`;
    }
    return "";
  }, [dates, title]);

  useEffect(() => {
    onDatesChange(dates);
  }, [dates, onDatesChange]);

  const onDateSelected = ({ selectable, date }: { selectable: boolean; date: Date }) => {
    if (!selectable || (isDateSelectable && !isDateSelectable(date))) return;
    if (dates.length === numberOfDates) {
      setDates([date]);
    } else {
      setDates([...dates, date].sort((a, b) => a.getTime() - b.getTime()));
      if (dates.length === 1) {
        onDatesChange([dates[0], date].sort((a, b) => a.getTime() - b.getTime()));
      }
    }
  };

  const isInRange = (date: Date) => {
    if (dates.length < 2) return false;
    const [start, end] = dates;
    return date >= start && date <= end;
  };

  const renderDate = (dateObj: { selectable: boolean; date: Date }) => {
    const { date, selectable } = dateObj;
    const isSelected = dates.some(
      (d) =>
        dayjs(d).startOf("day").toISOString() === dayjs(date).startOf("day").toISOString(),
    );
    const isRange = isInRange(date);
    const isToday = dayjs(date).isSame(dayjs(), "day");

    const getBgColor = () => {
      if (isSelected) return "brandYellow.600";
      if (isRange) return "#fffccacc";
      if (dates.length === 0 && isToday) return "brandYellow.600";
      return "darkBlue2.900";
    };

    const bgColor = getBgColor();
    const color =
      isSelected || isRange || (dates.length === 0 && isToday)
        ? "brandBlue.800"
        : "gray.400";

    return (
      <Button
        borderRadius="4px"
        boxSize={10}
        key={date.toISOString()}
        bg={bgColor}
        color={color}
        onClick={() => onDateSelected(dateObj)}
        isDisabled={!selectable || (isDateSelectable && !isDateSelectable(date))}
        _hover={{ color: "darkBlue2.500" }}
      >
        {date.getDate()}
      </Button>
    );
  };

  const popoverContent = (
    <PopoverContent
      minW="fit-content"
      borderRadius="16px"
      p="20px"
      bgColor="darkBlue2.900"
      borderWidth={0}
      boxShadow="0 7px 14px 0 rgba(0, 0, 0, 0.16)"
      zIndex={portalZIndex}
    >
      <PopoverArrow
        bgColor="darkBlue2.900"
        boxShadow="-1px -1px 1px 0 darkBlue2.900 !important"
      />
      <PopoverCloseButton color="white" size="lg" ml="31px" mt="12px" />
      <PopoverHeader pb="15px" borderColor="rgba(255,255,255,0.3)">
        <Text textStyle="captionSemi">{selectedDateString}</Text>
      </PopoverHeader>
      <PopoverBody py="18px">
        <Dayzed
          onDateSelected={onDateSelected}
          selected={dates}
          render={({ calendars, getBackProps, getForwardProps }) => (
            <Box>
              {calendars.map((calendar) => (
                <Box key={`${calendar.month}${calendar.year}`} textAlign="center">
                  <Box
                    mb={3}
                    justifyContent="space-between"
                    display="flex"
                    alignItems="center"
                  >
                    <IconButton
                      boxSize={10}
                      colorScheme="brandYellow"
                      aria-label="Previous Month"
                      icon={<ArrowBackIcon boxSize={5} />}
                      color="brandBlue.800"
                      {...getBackProps({ calendars })}
                      mr="5"
                    />
                    <Text textStyle="bodyBold" textAlign="center">
                      {calendar.month + 1} - {calendar.year}
                    </Text>
                    <IconButton
                      boxSize={10}
                      colorScheme="brandYellow"
                      aria-label="Next Month"
                      icon={<ArrowForwardIcon boxSize={5} />}
                      color="brandBlue.800"
                      {...getForwardProps({ calendars })}
                      ml="5"
                    />
                  </Box>
                  <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap="8px">
                    {calendar.weeks.map((week) =>
                      week.map((dateObj, idx) =>
                        dateObj ? (
                          renderDate(dateObj)
                        ) : (
                          <Box key={idx + 1} boxSize={10}></Box>
                        ),
                      ),
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        />
      </PopoverBody>
      <PopoverFooter borderColor="darkBlue2.900">
        {!disableClear && (
          <Button
            minW="130px"
            variant="outline"
            colorScheme="brandYellow"
            onClick={() => setDates([])}
          >
            Clear
          </Button>
        )}
      </PopoverFooter>
    </PopoverContent>
  );

  return (
    <Popover placement="left-end">
      <PopoverTrigger>
        <Button
          {...buttonStyleProps}
          isDisabled={isDisabled}
          variant="outline"
          color="white"
          py="8px"
          px="12px"
          leftIcon={LeftIcon ?? undefined}
          rightIcon={RightIcon ?? undefined}
        >
          {selectedDateString}
        </Button>
      </PopoverTrigger>
      {usePortal ? <Portal>{popoverContent}</Portal> : popoverContent}
    </Popover>
  );
};

export default DateRangePicker;
