import React, { Dispatch, SetStateAction } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  Text,
  HStack,
  Input,
  RadioGroup,
  Radio,
  VStack,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import CustomRepetitionSettings from "./CustomRepetitionSettings";
import {
  RepetitionSettings,
  RepeatEnum,
  MonthlyRepeatType,
  RepeatEnds,
} from "../../types/Repetition.ts";
import { INPUT_SIZES } from "../../constants/inputSizes";
import { RepetitionDropdown } from "./RepetitionDropdown.tsx";
import DateRangePicker from "../DateRangePicker/DateRangePicker";
import { handleEndsOnDateSelectable } from "../../utils/dateUtils";

interface CYRepetitionProps {
  isEnabled: boolean;
  settings: RepetitionSettings;
  onChangeEnabled: Dispatch<SetStateAction<boolean>>;
  onChangeSettings: (value: SetStateAction<RepetitionSettings>) => void;
  onCHangeLnQName: (value: string) => void;
  lnqStartDate?: Date;
  lnqName?: string;
}

const CYRepetition: React.FC<CYRepetitionProps> = ({
  isEnabled,
  settings,
  onChangeEnabled,
  onChangeSettings,
  lnqStartDate,
  onCHangeLnQName,
  lnqName,
}) => {
  const updateSettings = (updates: Partial<RepetitionSettings>) => {
    onChangeSettings(
      (prevSettings: RepetitionSettings): RepetitionSettings => ({
        ...prevSettings,
        ...updates,
      }),
    );
  };

  return (
    <Box>
      <Text fontSize="24px" fontWeight="700" color="white" textAlign="center">
        LnQ Parameters
      </Text>
      {!isEnabled && (
        <Text fontSize="16px" fontWeight="700" color="#8E959E" pt={8}>
          Will this LnQ be a repeating occurence
        </Text>
      )}
      <FormControl pt={3} mb={6}>
        {isEnabled && (
          <HStack alignItems="center" justifyContent="space-between" pt={3}>
            <Text color="white" minW="120px">
              LnQ Name
            </Text>
            <Input
              value={lnqName ?? ""}
              onChange={(e) => onCHangeLnQName(e.target.value)}
              color="white"
              colorScheme="brandYellow"
              placeholder="Enter LnQ name"
              w={INPUT_SIZES.STANDARD}
            />
          </HStack>
        )}
        {isEnabled && (
          <Text fontSize="16px" py={2} fontWeight="700" color="#8E959E">
            Repeat
          </Text>
        )}
        <HStack alignItems="center" justifyContent="space-between" mb={6}>
          <Checkbox
            colorScheme="brandYellow"
            isChecked={isEnabled}
            onChange={(e) => onChangeEnabled(e.target.checked)}
          >
            <Text color="white">Repeat</Text>
          </Checkbox>

          <RepetitionDropdown
            value={settings.repeat ?? RepeatEnum.DAILY}
            options={[
              { value: RepeatEnum.DAILY, label: "Daily" },
              { value: RepeatEnum.WEEKLY, label: "Weekly" },
              { value: RepeatEnum.MONTHLY, label: "Monthly" },
              { value: RepeatEnum.CUSTOM, label: "Custom" },
            ]}
            onSelect={(value) => {
              const updates: Partial<RepetitionSettings> = {
                repeat: value as RepeatEnum,
              };

              if ((value as RepeatEnum) === RepeatEnum.MONTHLY) {
                const selectedDate = lnqStartDate ?? new Date();
                const dayOfMonth = selectedDate.getDate();
                const weekOfMonth = Math.floor(dayOfMonth / 7) + 1;

                updates.monthlyRepeatType = MonthlyRepeatType.DAY_OF_MONTH;
                updates.dayOfMonth = dayOfMonth;
                updates.weekOfMonth = weekOfMonth;
              }

              updateSettings(updates);
            }}
            isDisabled={!isEnabled}
          />
        </HStack>

        {isEnabled ? (
          <>
            {settings.repeat === RepeatEnum.CUSTOM && (
              <Box borderTop="1px solid #8E959E" mt={4} />
            )}
            <CustomRepetitionSettings
              isEnabled={isEnabled}
              customSettings={settings}
              onUpdateSettings={updateSettings}
              lnqStartDate={lnqStartDate}
            />
            {isEnabled && settings.repeat !== RepeatEnum.CUSTOM && (
              <RadioGroup
                value={settings.ends}
                onChange={(value) => {
                  const newEnds = value as RepeatEnds;
                  if (newEnds === RepeatEnds.NEVER) {
                    updateSettings({ ends: newEnds, endsOn: undefined });
                  } else {
                    updateSettings({ ends: newEnds });
                  }
                }}
                isDisabled={!isEnabled}
              >
                <VStack align="flex-start" width="100%" spacing={4}>
                  <HStack width="100%" justifyContent="space-between" alignItems="center">
                    <Radio value={RepeatEnds.NEVER} colorScheme="brandYellow">
                      <Text color="white">No end date</Text>
                    </Radio>
                    <Box display="flex" gap={4} alignItems="center">
                      <Radio value={RepeatEnds.ON_DATE} colorScheme="brandYellow" />
                      <DateRangePicker
                        variant="single"
                        rightIcon={<CalendarIcon color="yellow" />}
                        buttonStyle={{}}
                        size="sm"
                        w={200}
                        onDatesChange={(dates) => {
                          updateSettings({ endsOn: dates[0] });
                        }}
                        initialDates={
                          settings.ends === RepeatEnds.ON_DATE && settings.endsOn
                            ? [settings.endsOn]
                            : []
                        }
                        isDisabled={settings.ends !== RepeatEnds.ON_DATE || !isEnabled}
                        isDateSelectable={(date) =>
                          handleEndsOnDateSelectable(date, lnqStartDate)
                        }
                        usePortal={false}
                      />
                    </Box>
                  </HStack>
                </VStack>
              </RadioGroup>
            )}
          </>
        ) : null}
      </FormControl>
    </Box>
  );
};

export default CYRepetition;
