import React, { useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import dayjs from "dayjs";

import { ModalContainer } from "~components/ModalContainer";
import DateRangePicker from "~components/DateRangePicker/DateRangePicker";

interface BulkPaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dateRange: Date[]) => void;
  isLoading?: boolean;
}

export const BulkPaymentStatusModal: React.FC<BulkPaymentStatusModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedDateRange, setSelectedDateRange] = useState<Date[]>([]);
  const [validationError, setValidationError] = useState<string>("");

  const validateDateRange = (dates: Date[]): string => {
    if (dates.length !== 2) {
      return "Please select both start and end dates.";
    }

    const [startDate, endDate] = dates;
    const diffInDays = dayjs(endDate).diff(dayjs(startDate), "day");

    if (diffInDays > 31) {
      return "Date range cannot exceed 1 month (31 days).";
    }

    return "";
  };

  const handleConfirm = () => {
    const error = validateDateRange(selectedDateRange);
    if (!error) {
      onConfirm(selectedDateRange);
    }
  };

  const handleClose = () => {
    setSelectedDateRange([]);
    setValidationError("");
    onClose();
  };

  const handleDateChange = (dates: Date[]) => {
    setSelectedDateRange(dates);
    if (dates.length === 2) {
      const error = validateDateRange(dates);
      setValidationError(error);
    } else {
      setValidationError("");
    }
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title="Mark All As Paid"
      leftButtonTitle="Cancel"
      rightButtonTitle="Confirm"
      onClickLeftButton={handleClose}
      onClickRightButton={handleConfirm}
      leftButtonEnabled={!isLoading}
      rightButtonEnabled={!isLoading && selectedDateRange.length === 2 && !validationError}
    >
      <Box py="4">
        <Text textStyle="sm" color="gray.400" mb="4">
          Select a date range to mark all studies completed within this period as paid. The
          date range cannot exceed 1 month (31 days).
        </Text>
        <DateRangePicker
          onDatesChange={handleDateChange}
          variant="range"
          buttonStyle={{ minW: "100%" }}
          usePortal={false}
        />
        {validationError && (
          <Text textStyle="sm" color="red.400" mt="2">
            {validationError}
          </Text>
        )}
        {selectedDateRange.length === 2 && !validationError && (
          <Text textStyle="sm" color="gray.300" mt="4">
            All studies completed between {dayjs(selectedDateRange[0]).format("MM/DD/YYYY")}{" "}
            and {dayjs(selectedDateRange[1]).format("MM/DD/YYYY")} will be marked as paid.
          </Text>
        )}
      </Box>
    </ModalContainer>
  );
};
