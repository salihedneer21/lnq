import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, Button, Text } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { MonthlyRepeatType } from "../../types/Repetition";

interface MonthlySelectorProps {
  selectedDate: Date;
  value: MonthlyRepeatType;
  onOptionSelect: (option: MonthlyRepeatType) => void;
  isDisabled?: boolean;
}

const getWeekOrdinal = (weekOfMonth: number): string => {
  if (weekOfMonth === 1) return "1st";
  if (weekOfMonth === 2) return "2nd";
  if (weekOfMonth === 3) return "3rd";
  return `${weekOfMonth}th`;
};

const getDisplayText = (
  value: MonthlyRepeatType,
  dayOfMonth: number,
  weekOfMonth: number,
  dayOfWeek: string,
) => {
  if (value === MonthlyRepeatType.DAY_OF_MONTH) {
    let suffix = "th";
    if (dayOfMonth % 10 === 1 && dayOfMonth !== 11) suffix = "st";
    else if (dayOfMonth % 10 === 2 && dayOfMonth !== 12) suffix = "nd";
    else if (dayOfMonth % 10 === 3 && dayOfMonth !== 13) suffix = "rd";
    return `Monthly on ${dayOfMonth}${suffix}`;
  }
  const weekText = getWeekOrdinal(weekOfMonth);
  const shortDayName = dayOfWeek.slice(0, 3);
  return `Monthly on ${weekText} ${shortDayName}`;
};

const MonthlySelector: React.FC<MonthlySelectorProps> = ({
  selectedDate,
  value,
  onOptionSelect,
  isDisabled = false,
}) => {
  const dayOfMonth = selectedDate.getDate();
  const weekOfMonth = Math.floor(dayOfMonth / 7) + 1;
  const dayOfWeek = selectedDate.toLocaleString("en-US", { weekday: "long" });

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        color="white"
        w="100%"
        h="38px"
        textAlign="left"
        isDisabled={isDisabled}
      >
        {getDisplayText(value, dayOfMonth, weekOfMonth, dayOfWeek)}
      </MenuButton>
      <MenuList bg="darkBlue2.900" border="none">
        <MenuItem
          color="white"
          bg="darkBlue2.900"
          _hover={{ bg: "darkBlue2.800" }}
          onClick={() => onOptionSelect(MonthlyRepeatType.DAY_OF_MONTH)}
        >
          <Text color="white">
            {getDisplayText(
              MonthlyRepeatType.DAY_OF_MONTH,
              dayOfMonth,
              weekOfMonth,
              dayOfWeek,
            )}
          </Text>
        </MenuItem>
        <MenuItem
          color="white"
          bg="darkBlue2.900"
          _hover={{ bg: "darkBlue2.800" }}
          onClick={() => onOptionSelect(MonthlyRepeatType.NTH_DAY_OF_WEEK)}
        >
          <Text color="white">
            {getDisplayText(
              MonthlyRepeatType.NTH_DAY_OF_WEEK,
              dayOfMonth,
              weekOfMonth,
              dayOfWeek,
            )}
          </Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default MonthlySelector;
