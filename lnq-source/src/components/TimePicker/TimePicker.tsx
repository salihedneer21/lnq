import React, { CSSProperties, useMemo } from "react";
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from "@chakra-ui/react";
import { FixedSizeList as List } from "react-window";
import { getTimeZoneAbbreviation, getUserTimeZone } from "../../utils/timeZones.ts";

const generateTimes = () => {
  const times: { display: string; value: string }[] = [];
  const timeZoneAbbr = getTimeZoneAbbreviation(getUserTimeZone());

  for (let i = 0; i < 24 * 60; i += 5) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const timeValue = `${formattedHours}:${formattedMinutes} ${ampm}`;
    const timeDisplay = `${timeValue} (${timeZoneAbbr})`;
    times.push({ display: timeDisplay, value: timeValue });
  }
  return times;
};

const parseTime = (timeStr: string): Date => {
  const [time, ampm] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  const adjustedHours = () => {
    const ampmLower = ampm.toLowerCase();
    if (ampmLower === "pm" && hours !== 12) return hours + 12;
    if (ampmLower === "am" && hours === 12) return 0;
    return hours;
  };

  date.setHours(adjustedHours(), minutes, 0, 0);
  return date;
};

interface Props {
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  isDisabled?: boolean;
  isErrored?: boolean;
  filterTimes?: (time: string) => boolean;
  currentDate?: Date;
}

export const TimePicker: React.FC<Props> = ({
  selectedTime,
  setSelectedTime,
  isDisabled,
  isErrored,
  filterTimes,
  currentDate,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const times = useMemo(generateTimes, []);

  const filteredTimes = useMemo(() => {
    const now = new Date();
    const isToday = currentDate && currentDate.toDateString() === now.toDateString();

    return times.filter(({ value }) => {
      let passesTimeFilter = true;
      if (isToday) {
        const timeDate = parseTime(value);
        passesTimeFilter = timeDate > now;
      }

      const passesCustomFilter = filterTimes ? filterTimes(value) : true;

      return passesTimeFilter && passesCustomFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTimes, currentDate]);

  const renderRow = ({ index, style }: { index: number; style: CSSProperties }) => (
    <MenuItem
      key={filteredTimes[index].value}
      style={style}
      bgColor="darkBlue2.900"
      color="white"
      fontWeight="400"
      fontSize="16px"
      lineHeight="24px"
      onClick={() => {
        setSelectedTime(filteredTimes[index].value);
        onClose();
      }}
    >
      {filteredTimes[index].display}
    </MenuItem>
  );

  const selectedTimeWithZone = useMemo(() => {
    if (selectedTime === "End Time" || selectedTime === "Start Time") return selectedTime;
    const timeZoneAbbr = getTimeZoneAbbreviation(getUserTimeZone());
    return `${selectedTime} (${timeZoneAbbr})`;
  }, [selectedTime]);

  return (
    <Menu isOpen={isOpen} onClose={onClose} isLazy>
      <MenuButton
        isDisabled={isDisabled}
        variant="outline"
        h="56px"
        color="white"
        fontWeight="400"
        fontSize="16px"
        lineHeight="24px"
        as={Button}
        onClick={onOpen}
        borderColor={isErrored ? "red.500" : undefined}
      >
        {selectedTimeWithZone}
      </MenuButton>
      <MenuList
        bgColor="darkBlue2.900"
        border="none"
        padding="16px, 12px, 16px, 12px"
        maxH="304px"
        w="237px"
        overflowY="hidden"
        borderRadius="4px"
      >
        {isOpen && (
          <List height={296} itemCount={filteredTimes.length} itemSize={32} width="100%">
            {renderRow}
          </List>
        )}
      </MenuList>
    </Menu>
  );
};
