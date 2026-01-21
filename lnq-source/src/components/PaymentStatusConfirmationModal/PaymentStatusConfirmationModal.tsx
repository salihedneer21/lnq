import { Text, Box, Button, VStack } from "@chakra-ui/react";
import React from "react";

import { ModalContainer } from "../ModalContainer";

interface PaymentStatusConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onBack?: () => void;
  onContinueProcessing?: () => void;
  type: "bulk" | "individual";
  selectedDate?: string;
  isLoading?: boolean;
  showContinueProcessing?: boolean;
  remainingCount?: number;
  totalProcessed?: number;
}

export const PaymentStatusConfirmationModal: React.FC<
  PaymentStatusConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  onBack,
  onContinueProcessing,
  type,
  selectedDate,
  isLoading = false,
  showContinueProcessing = false,
  remainingCount = 0,
  totalProcessed = 0,
}) => {
  const getTitle = () => {
    if (showContinueProcessing) {
      return "Continue Processing Remaining Studies";
    }

    if (type === "bulk") {
      return (
        <>
          Are you sure you want to mark all studies completed between{" "}
          <Text as="span" color="brandYellow.500">
            {selectedDate}
          </Text>{" "}
          as paid?
        </>
      );
    }

    return "Are you sure you want to mark this study as paid?";
  };

  const getContent = () => {
    if (showContinueProcessing) {
      return (
        <VStack spacing={4} align="stretch">
          <Text textAlign="center" color="white">
            Successfully processed{" "}
            <Text as="span" color="brandYellow.500" fontWeight="bold">
              {totalProcessed}
            </Text>{" "}
            studies.
          </Text>
          <Text textAlign="center" color="brandYellow.500" fontWeight="bold">
            {remainingCount} studies still need to be processed.
          </Text>
          <Text textAlign="center" fontSize="sm" color="gray.400">
            Would you like to continue processing the remaining studies in the next batch?
          </Text>
        </VStack>
      );
    }
    return null;
  };

  const getButtons = () => {
    if (showContinueProcessing) {
      return (
        <VStack spacing={3} w="full">
          <Button
            variant="solid"
            colorScheme="brandYellow"
            color="brandBlue.800"
            w="full"
            onClick={() => {
              onContinueProcessing?.();
            }}
            isLoading={isLoading}
            loadingText="Processing..."
          >
            Continue Processing ({remainingCount} remaining)
          </Button>
          <Button
            variant="outline"
            color="white"
            w="full"
            onClick={onClose}
            isDisabled={isLoading}
          >
            Close
          </Button>
        </VStack>
      );
    }

    return (
      <VStack spacing={3} w="full">
        <Button
          variant="solid"
          color="brandBlue.800"
          bgColor="brandYellow.500"
          w="full"
          onClick={() => {
            onConfirm();
          }}
          isLoading={isLoading}
          loadingText="Processing..."
        >
          Yes, Mark as Paid
        </Button>
        <Box display="flex" gap={3} w="full">
          {onBack && (
            <Button
              variant="outline"
              color="white"
              flex={1}
              onClick={onBack}
              isDisabled={isLoading}
            >
              Back to Edit Dates
            </Button>
          )}
          <Button
            variant="outline"
            color="white"
            flex={1}
            onClick={onClose}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
        </Box>
      </VStack>
    );
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      hideFooter={true}
      leftButtonTitle=""
      rightButtonTitle=""
    >
      <VStack spacing={6} p={4}>
        {getContent()}
        {getButtons()}
      </VStack>
    </ModalContainer>
  );
};
