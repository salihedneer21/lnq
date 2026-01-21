import React, { useState, Dispatch, SetStateAction } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Text,
} from "@chakra-ui/react";
import { DistributionType, Limits } from "../../types/CodeYellow";
import { useUpdateCodeYellow } from "../../api/CodeYellowApi";
import SetupRVUStep from "./SetupRVUStep";
import CYParametersStep from "./CYParametersStep";
import SetupCYLimitsStep from "./SetupCYLimitsStep";
import ProvidersListStep from "./ProvidersListStep";
import { useCYProviders } from "../../hooks/useCYProviders";
import { CodeYellowResponse } from "~/types/CodeYellowResponse";

enum Steps {
  SETUP_RVU,
  CY_PARAMETERS,
  SETUP_RVU_LIMITS,
  PROVIDERS_LIST,
}

interface EditCodeYellowModalProps {
  isOpen: boolean;
  onClose: () => void;
  codeYellow: CodeYellowResponse;
}

const EditCodeYellowModal: React.FC<EditCodeYellowModalProps> = ({
  isOpen,
  onClose,
  codeYellow,
}) => {
  const groupId = codeYellow?.worklist?.groupId ?? codeYellow?.group?.id;

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.SETUP_RVU);
  const [rvu, setRvu] = useState<number>(codeYellow.usdPerRvu);

  const [dateRange, setDateRange] = useState<{ start: string; end?: string }>({
    start: new Date(codeYellow.startTime).toISOString(),
    end: codeYellow.endTime ? new Date(codeYellow.endTime).toISOString() : undefined,
  });
  const [limits, setLimits] = useState<Limits>({
    amountLimit: codeYellow.amountLimit ?? undefined,
    RVUsLimit: codeYellow.rvusLimit ?? undefined,
  });

  const targetedProviderSettings = useCYProviders({
    groupId: groupId,
    dateRange,
    codeYellowId: codeYellow?.id,
    editing: true,
    targetedProvidersCount: codeYellow?.targetedProvidersCount,
  });

  const { mutate: updateCodeYellow } = useUpdateCodeYellow();

  const handleNextStep = () => {
    if (rvu == null || rvu === 0) {
      return;
    }
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleConfirm = () => {
    if (currentStep === Steps.PROVIDERS_LIST) {
      updateCodeYellow({
        codeYellowId: codeYellow.id,
        usdPerRvu: rvu,
        startTime: dateRange.start,
        endTime: dateRange.end ?? null,
        limits,
        distributionType: targetedProviderSettings.targetProviders
          ? DistributionType.TARGET
          : DistributionType.OPEN,
        userIds: targetedProviderSettings.targetProviders
          ? targetedProviderSettings.selectedIds
          : [],
      });
      targetedProviderSettings.reset();
      onClose();
    } else {
      handleNextStep();
    }
  };

  const handleCancel = () => {
    targetedProviderSettings.reset();
    onClose();
  };

  const handleLeftButtonClick = () => {
    if (currentStep === Steps.SETUP_RVU) {
      handleCancel();
    } else {
      handleBack();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <ModalOverlay bg="#14153233" />
      <ModalContent
        w="500px"
        maxWidth="70vw"
        h="auto"
        p="12"
        my="auto"
        mx="auto"
        borderRadius="24px"
        bgColor="darkBlue2.800"
      >
        <ModalHeader textAlign="center" color="white" fontSize="3xl" pt="0" pb="5" px="0">
          Edit LnQ
        </ModalHeader>
        <ModalBody p="0" mb="8">
          {currentStep === Steps.SETUP_RVU && <SetupRVUStep rvu={rvu} setRvu={setRvu} />}
          {currentStep === Steps.CY_PARAMETERS && (
            <CYParametersStep
              dateRangeDidChange={
                setDateRange as Dispatch<
                  SetStateAction<{ start: string; end?: string } | undefined>
                >
              }
              initialDateRange={dateRange}
            />
          )}
          {currentStep === Steps.SETUP_RVU_LIMITS && (
            <SetupCYLimitsStep setLimits={setLimits} initialLimits={limits} />
          )}
          {currentStep === Steps.PROVIDERS_LIST && (
            <ProvidersListStep targetedProviderSettings={targetedProviderSettings} />
          )}
        </ModalBody>
        <ModalFooter justifyContent="space-between" p="0">
          <Button variant="outline" color="white" w="48%" onClick={handleLeftButtonClick}>
            <Text color="white" fontWeight="700" fontSize="16">
              {currentStep === Steps.SETUP_RVU ? "Cancel" : "Back"}
            </Text>
          </Button>
          <Button
            colorScheme="brandYellow"
            w="48%"
            onClick={handleConfirm}
            isDisabled={currentStep === Steps.CY_PARAMETERS && !dateRange?.start}
          >
            <Text color="white" fontWeight="700" fontSize="16">
              {currentStep === Steps.PROVIDERS_LIST ? "Confirm" : "Next"}
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditCodeYellowModal;
