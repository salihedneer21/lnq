import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import React from "react";

interface Props {
  highestPayingActiveAlertString: string;
  otherActiveAlertsString: string;
}

const ActiveAlertsPopover: React.FC<Props> = ({
  highestPayingActiveAlertString,
  otherActiveAlertsString,
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          isDisabled={!otherActiveAlertsString}
          variant="link"
          colorScheme="whiteAlpha"
          _disabled={{
            color: "white",
            cursor: "default",
          }}
        >
          <Tooltip
            isDisabled={!otherActiveAlertsString}
            hasArrow
            label="Other Active Alerts"
            fontSize="md"
          >
            <Text as={!otherActiveAlertsString ? "p" : "u"} textStyle="sm">
              {highestPayingActiveAlertString}
            </Text>
          </Tooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent bgColor="darkBlue2.900">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Other Active Alerts</PopoverHeader>
        <PopoverBody whiteSpace="break-spaces">{otherActiveAlertsString}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ActiveAlertsPopover;
