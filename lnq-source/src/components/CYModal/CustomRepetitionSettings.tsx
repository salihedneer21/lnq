import React from "react";
import WeeklySelector from "./WeeklySelector";
import MonthlySelector from "./MonthlySelector";
import EndsSettings from "./EndsSettings";
import {
  Box,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  RepetitionSettings,
  MonthlyRepeatType,
  RepeatIntervalUnit,
  RepeatEnum,
  RepeatDay,
} from "../../types/Repetition.ts";
import { INPUT_SIZES } from "../../constants/inputSizes";

interface CustomRepetitionSettingsProps {
  isEnabled: boolean;
  customSettings: RepetitionSettings;
  onUpdateSettings: (settings: Partial<RepetitionSettings>) => void;
  lnqStartDate?: Date;
}

const CustomRepetitionSettings: React.FC<CustomRepetitionSettingsProps> = ({
  isEnabled,
  customSettings,
  onUpdateSettings,
  lnqStartDate,
}) => {
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const handleMonthlyOptionSelect = (option: string) => {
    const monthlyOption = option as MonthlyRepeatType;
    const selectedDate = lnqStartDate ?? new Date();
    const dayOfMonth = selectedDate.getDate();
    const weekOfMonth = Math.floor(dayOfMonth / 7) + 1;
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Map day number to RepeatDay enum
    const dayMap: Record<number, RepeatDay> = {
      0: RepeatDay.SUNDAY,
      1: RepeatDay.MONDAY,
      2: RepeatDay.TUESDAY,
      3: RepeatDay.WEDNESDAY,
      4: RepeatDay.THURSDAY,
      5: RepeatDay.FRIDAY,
      6: RepeatDay.SATURDAY,
    };

    onUpdateSettings({
      monthlyRepeatType: monthlyOption,
      dayOfMonth: monthlyOption === MonthlyRepeatType.DAY_OF_MONTH ? dayOfMonth : undefined,
      weekOfMonth:
        monthlyOption === MonthlyRepeatType.NTH_DAY_OF_WEEK ? weekOfMonth : undefined,
      repeatOn:
        monthlyOption === MonthlyRepeatType.NTH_DAY_OF_WEEK
          ? [dayMap[dayOfWeek]]
          : undefined,
    });
  };

  const handleWeeklyDaysChange = (days: RepeatDay[]) => {
    onUpdateSettings({ repeatOn: days });
  };

  return (
    <>
      <Box mb={6}>
        {customSettings.repeat === RepeatEnum.WEEKLY && (
          <Box mt={4}>
            <WeeklySelector
              selectedDays={customSettings.repeatOn ?? []}
              onDaysChange={handleWeeklyDaysChange}
              isDisabled={!isEnabled}
            />
          </Box>
        )}

        {customSettings.repeat === RepeatEnum.MONTHLY && (
          <Box mt={4}>
            <MonthlySelector
              selectedDate={lnqStartDate ?? new Date()}
              value={customSettings.monthlyRepeatType ?? MonthlyRepeatType.DAY_OF_MONTH}
              onOptionSelect={handleMonthlyOptionSelect}
              isDisabled={!isEnabled}
            />
          </Box>
        )}
      </Box>

      {customSettings.repeat === RepeatEnum.CUSTOM && (
        <Box>
          <Text color="gray.400" mb={4}>
            Repeat every
          </Text>
          <HStack spacing={8} width="100%" alignItems="center" mb={6}>
            <NumberInput
              defaultValue={customSettings.repeatEvery || 1}
              min={1}
              max={30}
              onChange={(_, value) => onUpdateSettings({ repeatEvery: value })}
              w={INPUT_SIZES.NUMBER}
            >
              <NumberInputField color="white" />
              <NumberInputStepper>
                <NumberIncrementStepper color="white" />
                <NumberDecrementStepper color="white" />
              </NumberInputStepper>
            </NumberInput>

            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="outline"
                color="white"
                w={INPUT_SIZES.STANDARD}
                textAlign="left"
                textTransform="capitalize"
              >
                {capitalizeFirst(
                  customSettings.repeatIntervalUnit || RepeatIntervalUnit.DAY,
                )}
              </MenuButton>
              <MenuList bg="darkBlue2.900" border="none">
                <MenuItem
                  color="white"
                  bg="darkBlue2.900"
                  _hover={{ bg: "darkBlue2.800" }}
                  onClick={() =>
                    onUpdateSettings({ repeatIntervalUnit: RepeatIntervalUnit.DAY })
                  }
                >
                  Day
                </MenuItem>
                <MenuItem
                  color="white"
                  bg="darkBlue2.900"
                  _hover={{ bg: "darkBlue2.800" }}
                  onClick={() =>
                    onUpdateSettings({ repeatIntervalUnit: RepeatIntervalUnit.WEEK })
                  }
                >
                  Week
                </MenuItem>
                <MenuItem
                  color="white"
                  bg="darkBlue2.900"
                  _hover={{ bg: "darkBlue2.800" }}
                  onClick={() => {
                    const selectedDate = lnqStartDate ?? new Date();
                    const dayOfMonth = selectedDate.getDate();
                    const weekOfMonth = Math.floor(dayOfMonth / 7) + 1;

                    onUpdateSettings({
                      repeatIntervalUnit: RepeatIntervalUnit.MONTH,
                      monthlyRepeatType: MonthlyRepeatType.DAY_OF_MONTH,
                      dayOfMonth: dayOfMonth,
                      weekOfMonth: weekOfMonth,
                    });
                  }}
                >
                  Month
                </MenuItem>
                <MenuItem
                  color="white"
                  bg="darkBlue2.900"
                  _hover={{ bg: "darkBlue2.800" }}
                  onClick={() =>
                    onUpdateSettings({ repeatIntervalUnit: RepeatIntervalUnit.YEAR })
                  }
                >
                  Year
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
          {customSettings.repeatIntervalUnit === RepeatIntervalUnit.WEEK ? (
            <Box mb={4}>
              <Text color="gray.400" mb={4}>
                Repeat on
              </Text>
              <WeeklySelector
                selectedDays={customSettings.repeatOn ?? []}
                onDaysChange={(days) => onUpdateSettings({ repeatOn: days })}
              />
            </Box>
          ) : null}

          {customSettings.repeatIntervalUnit === RepeatIntervalUnit.MONTH ? (
            <Box mb={4}>
              <MonthlySelector
                selectedDate={lnqStartDate ?? new Date()}
                value={customSettings.monthlyRepeatType ?? MonthlyRepeatType.DAY_OF_MONTH}
                onOptionSelect={handleMonthlyOptionSelect}
              />
            </Box>
          ) : null}

          <EndsSettings
            settings={customSettings}
            onUpdateSettings={onUpdateSettings}
            isDisabled={!isEnabled}
            lnqStartDate={lnqStartDate}
          />
        </Box>
      )}
    </>
  );
};

export default CustomRepetitionSettings;
