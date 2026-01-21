import React from "react";
import {
  Box,
  Text,
  Radio,
  RadioGroup,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import DateRangePicker from "../DateRangePicker/DateRangePicker";
import { RepetitionSettings, RepeatEnds } from "../../types/Repetition.ts";
import { INPUT_SIZES } from "../../constants/inputSizes";
import { handleEndsOnDateSelectable } from "../../utils/dateUtils";

interface EndsSettingsProps {
  settings: RepetitionSettings;
  onUpdateSettings: (settings: Partial<RepetitionSettings>) => void;
  isDisabled?: boolean;
  lnqStartDate?: Date;
}

const EndsSettings: React.FC<EndsSettingsProps> = ({
  settings,
  onUpdateSettings,
  isDisabled = false,
  lnqStartDate,
}) => {
  return (
    <Box>
      <Text color="gray.400" mb={4}>
        Ends
      </Text>
      <RadioGroup
        value={settings.ends}
        onChange={(value) => {
          const newEnds = value as RepeatEnds;
          if (newEnds === RepeatEnds.NEVER) {
            onUpdateSettings({ ends: newEnds, endsOn: undefined });
          } else {
            onUpdateSettings({ ends: newEnds });
          }
        }}
        isDisabled={isDisabled}
      >
        <VStack align="flex-start" spacing={4} width="100%">
          <Radio value={RepeatEnds.NEVER} colorScheme="brandYellow">
            <Text color="white">Never</Text>
          </Radio>

          <HStack
            spacing={2}
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Radio value={RepeatEnds.ON_DATE} colorScheme="brandYellow">
              <Text color="white">On</Text>
            </Radio>
            <Box ml={4} w={INPUT_SIZES.DATE}>
              <DateRangePicker
                variant="single"
                rightIcon={<CalendarIcon color="yellow" />}
                buttonStyle={{}}
                size="sm"
                onDatesChange={(dates) => {
                  onUpdateSettings({ endsOn: dates[0] });
                }}
                initialDates={
                  settings.ends === RepeatEnds.ON_DATE && settings.endsOn
                    ? [settings.endsOn]
                    : []
                }
                isDisabled={settings.ends !== RepeatEnds.ON_DATE || isDisabled}
                isDateSelectable={(date) => handleEndsOnDateSelectable(date, lnqStartDate)}
                usePortal={false}
              />
            </Box>
          </HStack>

          <HStack
            spacing={2}
            width="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Radio value={RepeatEnds.AFTER_OCCURRENCES} colorScheme="brandYellow">
              <Text color="white">After</Text>
            </Radio>
            <NumberInput
              defaultValue={0}
              min={0}
              max={999}
              w={INPUT_SIZES.NUMBER}
              ml={4}
              isDisabled={settings.ends !== RepeatEnds.AFTER_OCCURRENCES || isDisabled}
              onChange={(_, value) => onUpdateSettings({ afterOccurrences: value })}
            >
              <NumberInputField color="white" placeholder="0 occurrences" />
              <NumberInputStepper>
                <NumberIncrementStepper color="white" />
                <NumberDecrementStepper color="white" />
              </NumberInputStepper>
            </NumberInput>
          </HStack>
        </VStack>
      </RadioGroup>
    </Box>
  );
};

export default EndsSettings;
