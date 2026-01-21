import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React, { useImperativeHandle, useState } from "react";
import { useGetProvidersInGroupUsingIntegration } from "../../api/GroupApi";
import { ProvidersScheduleMode } from "../../types/Group";

import { EventsCalendar } from "../EventsCalendar/EventsCalendar";
import { getDefaultRange } from "../EventsCalendar/utils";

const GroupSchedule: React.ForwardRefRenderFunction<
  { open: () => void },
  {
    groupId: string;
    mode: ProvidersScheduleMode;
  }
> = (props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState(getDefaultRange());
  const { data: groupWithProviders } = useGetProvidersInGroupUsingIntegration(
    isOpen ? props.groupId : undefined,
    1,
    0,
    {
      mode: "group-schedule",
      startDate: range[0].toUTCString(),
      endDate: range[1].toUTCString(),
    },
  );

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setRange(getDefaultRange());
  };

  const handleSetRange = (range: [Date, Date]) => {
    setRange(range);
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        open: handleOpen,
      };
    },
    [],
  );

  return (
    <>
      <Text
        as="button"
        fontSize="xx-small"
        mb="1"
        color="gray.500"
        textDecoration="underline"
        onClick={handleOpen}
      >
        See full schedule
      </Text>
      <Modal {...props} isOpen={isOpen} onClose={handleClose} returnFocusOnClose={false}>
        <ModalHeader>Groups schedule</ModalHeader>
        <ModalOverlay />
        <ModalContent w="100%" maxWidth="95vw" minH="46rem" bgColor="darkBlue2.800">
          <ModalBody>
            <ModalCloseButton color="white" onClick={handleClose} />
            <EventsCalendar
              onDateRangeChanged={handleSetRange}
              range={range as [Date, Date]}
              groupProviders={groupWithProviders?.providers ?? []}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export const GroupScheduleModal = React.forwardRef(GroupSchedule);
