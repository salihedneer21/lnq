import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  VStack,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useState } from "react";

export type ReportType = "completedStudies" | "tatReport";

interface ReportTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportTypeSelected: (reportType: ReportType) => void;
}

export const ReportTypeSelectionModal: React.FC<ReportTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onReportTypeSelected,
}) => {
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType>("completedStudies");

  const handleConfirm = () => {
    onReportTypeSelected(selectedReportType);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.500" />
      <ModalContent
        w="500px"
        maxWidth="90vw"
        h="auto"
        p="8"
        my="auto"
        mx="auto"
        borderRadius="3xl"
        bgColor="darkBlue2.800"
        border="1px solid"
        borderColor="whiteAlpha.200"
      >
        <ModalBody p="0" mb="6">
          <Text color="white" fontSize="24" fontWeight="600" textAlign="center" mb="4">
            Export Report
          </Text>

          <Text color="white" fontSize="16" textAlign="center" mb="6">
            Please select a report type to export.
          </Text>

          <FormControl>
            <FormLabel color="whiteAlpha.700" fontSize="14" fontWeight="600" mb="3">
              Report Type
            </FormLabel>
            <RadioGroup
              value={selectedReportType}
              onChange={(value) => setSelectedReportType(value as ReportType)}
            >
              <VStack spacing="3" align="start">
                <Radio value="completedStudies" colorScheme="yellow" size="lg">
                  <Text color="white" fontSize="16">
                    Completed Studies
                  </Text>
                </Radio>
                <Radio value="tatReport" colorScheme="yellow" size="lg">
                  <Text color="white" fontSize="16">
                    Provider Turn Around Time
                  </Text>
                </Radio>
              </VStack>
            </RadioGroup>
          </FormControl>
        </ModalBody>

        <ModalFooter p="0" gap="3">
          <Button
            variant="outline"
            color="white"
            borderColor="white"
            bg="transparent"
            onClick={onClose}
            _hover={{ bg: "whiteAlpha.100" }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="brandYellow"
            bg="yellow.400"
            color="darkBlue2.800"
            onClick={handleConfirm}
            _hover={{ bg: "yellow.500" }}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
