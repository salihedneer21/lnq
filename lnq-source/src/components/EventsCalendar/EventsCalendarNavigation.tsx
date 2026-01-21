import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, IconButton, Stack } from "@chakra-ui/react";

interface EventsCalendarNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  onToday: () => void;
  onDayView: () => void;
  onViewWeek: () => void;
  onViewMonth: () => void;
  isDay: boolean;
  isWeek: boolean;
  isMonth: boolean;
}

export const EventsCalendarNavigation: React.FC<EventsCalendarNavigationProps> = (
  props,
) => (
  <Box as="nav" py="4">
    <Flex justify="space-between" width="w.100">
      <Stack direction="row" spacing={2}>
        <Button
          size="sm"
          onClick={props.onViewMonth}
          isActive={props.isMonth}
          aria-label="button for changing view type to month"
        >
          Month
        </Button>
        <Button
          size="sm"
          onClick={props.onViewWeek}
          isActive={props.isWeek}
          aria-label="button for changing view type to week"
        >
          Week
        </Button>
        <Button
          size="sm"
          onClick={props.onDayView}
          isActive={props.isDay}
          aria-label="button for changing view type to day"
        >
          Day
        </Button>
      </Stack>

      <Stack direction="row" spacing={4}>
        <IconButton
          size="sm"
          aria-label="button for navigating to prev calendar"
          icon={<ChevronLeftIcon />}
          onClick={props.onPrevious}
        />
        <IconButton
          size="sm"
          aria-label="button for navigating to next calendar"
          icon={<ChevronRightIcon />}
          onClick={props.onNext}
        />
      </Stack>
    </Flex>
  </Box>
);
