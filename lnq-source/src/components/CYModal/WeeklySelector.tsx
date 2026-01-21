import React from "react";
import { Button, HStack } from "@chakra-ui/react";
import { RepeatDay } from "../../types/Repetition";

interface WeeklySelectorProps {
  selectedDays: RepeatDay[];
  onDaysChange: (days: RepeatDay[]) => void;
  isDisabled?: boolean;
}

const WeeklySelector: React.FC<WeeklySelectorProps> = ({
  selectedDays,
  onDaysChange,
  isDisabled = false,
}) => {
  const days = [
    RepeatDay.MONDAY,
    RepeatDay.TUESDAY,
    RepeatDay.WEDNESDAY,
    RepeatDay.THURSDAY,
    RepeatDay.FRIDAY,
    RepeatDay.SATURDAY,
    RepeatDay.SUNDAY,
  ];

  const handleDayClick = (day: RepeatDay) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  return (
    <HStack justifyContent="space-between" wrap="nowrap">
      {days.map((day) => (
        <Button
          key={day}
          size="md"
          rounded="full"
          height="12"
          width="12"
          variant={selectedDays.includes(day) ? "solid" : "outline"}
          colorScheme="brandYellow"
          onClick={() => handleDayClick(day)}
          isDisabled={isDisabled}
        >
          {day.slice(0, 1).toUpperCase()}
        </Button>
      ))}
    </HStack>
  );
};

export default WeeklySelector;
