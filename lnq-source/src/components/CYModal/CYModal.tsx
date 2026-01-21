import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";

import { useGetGroup, useGetMyGroups } from "../../api/GroupApi.ts";
import { useGetUserWorklists } from "../../api/WorklistApi";
import { PROVIDER_PAGES } from "../../base/router/pages.ts";
import { useCYProviders } from "../../hooks/useCYProviders.ts";
import { Limits } from "../../types/CodeYellow.ts";
import { Group } from "../../types/Group.ts";
import { defaultRepetitionSettings, RepetitionSettings } from "../../types/Repetition.ts";
import { WorkListType } from "../../types/Worklist.ts";
import CYParametersStep from "./CYParametersStep";
import CYRepetition from "./CYRepetition";
import InitialStep from "./InitialStep";
import LnQTypeStep from "./LnQTypeStep";
import ProvidersListStep from "./ProvidersListStep";
import SetupCYLimitsStep from "./SetupCYLimitsStep.tsx";
import SetupRVUStep from "./SetupRVUStep";

import type { ActivateLnQOptions } from "~/types/ActivateLnqOptions";

interface Props {
  activate: (opts: ActivateLnQOptions) => void;
  type?: WorkListType;
  isOpen: boolean;
  onClose: () => void;
  groupName?: Group["facilityName"];
  groupId?: string;
  limits?: Limits;
  showLnQTypeSelection?: boolean;
  onLnQTypeSelected?: (type: WorkListType, groupId?: string) => void;
}

enum Steps {
  LNQ_TYPE_SELECTION,
  INITIAL,
  SETUP_RVU,
  CY_PARAMETERS,
  CY_REPETITION,
  SETUP_RVU_LIMITS,
  PROVIDERS_LIST,
}

export const CYModal = ({
  activate,
  isOpen,
  onClose,
  groupName,
  groupId: initialGroupId,
  type: initialType,
  showLnQTypeSelection = false,
  onLnQTypeSelected,
}: Props) => {
  // MAIN LOCAL STATE
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.LNQ_TYPE_SELECTION);
  const [lnqType, setLnqType] = useState<WorkListType>(WorkListType.GROUP);
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [rvu, setRvu] = useState<number>(45);
  const [dateRange, setDateRange] = useState<{ start: string; end?: string } | undefined>();
  const [limits, setLimits] = useState<Limits>({
    amountLimit: undefined,
    RVUsLimit: undefined,
  });
  const [repetitionEnabled, setRepetitionEnabled] = useState(false);
  const [repetitionSettings, setRepetitionSettings] = useState<RepetitionSettings>({
    ...defaultRepetitionSettings,
  });

  const [lnqName, setLnqName] = useState("");

  // Control references
  const hasInitialized = useRef(false);
  const navigate = useNavigate();

  // DETERMINE INITIAL STEP
  const determineInitialStep = useCallback(() => {
    if (showLnQTypeSelection) {
      return Steps.LNQ_TYPE_SELECTION;
    }

    if (initialType === WorkListType.PERSONAL) {
      return Steps.SETUP_RVU;
    }

    if (initialType === WorkListType.GROUP && initialGroupId) {
      return Steps.INITIAL;
    }

    return Steps.LNQ_TYPE_SELECTION;
  }, [showLnQTypeSelection, initialType, initialGroupId]);

  // FILTER GROUPS BASED ON LNQ TYPE
  const roleFilter = useMemo(
    () => (lnqType === WorkListType.GROUP ? ("admin" as const) : undefined),
    [lnqType],
  );

  // LOAD GROUP DATA
  const { data: myGroupsData } = useGetMyGroups(1, 0, roleFilter);
  const { data: groupData } = useGetGroup(groupId);
  useGetUserWorklists();

  // PROVIDER DATA
  const targetedProviderSettings = useCYProviders({
    groupId: isOpen && currentStep === Steps.PROVIDERS_LIST ? initialGroupId : undefined,
    dateRange,
  });

  // INITIALIZE LNQ TYPE AND GROUPS
  useEffect(() => {
    // Only run when modal opens and hasn't been initialized
    if (isOpen && !hasInitialized.current) {
      // Set initial step
      setCurrentStep(determineInitialStep());

      // Reset default values
      setRvu(45);
      setDateRange(undefined);
      setLimits({
        amountLimit: undefined,
        RVUsLimit: undefined,
      });
      setRepetitionEnabled(false);
      setRepetitionSettings({
        ...defaultRepetitionSettings,
      });
      setLnqName("");

      // Configure LnQ type (from props or default)
      setLnqType(initialType ?? WorkListType.GROUP);

      // Mark as initialized
      hasInitialized.current = true;
    }
  }, [isOpen, determineInitialStep, initialType]);

  // RESET WHEN MODAL CLOSES
  useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen]);

  // UPDATE SELECTED GROUP WHEN DATA CHANGES
  useEffect(() => {
    if (!isOpen || !myGroupsData?.docs) return;

    // For Personal LnQ type, we don't need to validate the group
    if (lnqType === WorkListType.PERSONAL) return;

    // Validate if the current group is valid
    const groupExists =
      initialGroupId && myGroupsData.docs.some((group) => group.id === initialGroupId);

    // If the initial group is valid, use it
    if (groupExists) {
      setGroupId(initialGroupId);
    }
    // If no valid group but there are available groups, use the first one
    else if (myGroupsData.docs.length > 0 && lnqType === WorkListType.GROUP) {
      setGroupId(myGroupsData.docs[0].id);
    }
    // If no available groups, set as undefined
    else {
      setGroupId(undefined);
    }
  }, [myGroupsData, initialGroupId, lnqType, isOpen]);

  // LNQ TYPE HANDLER
  const handleLnQTypeSelection = useCallback((type: WorkListType) => {
    setLnqType(type);
  }, []);

  // HANDLER TO ADVANCE TO NEXT STEP
  const handleNextStep = useCallback(() => {
    switch (currentStep) {
      case Steps.LNQ_TYPE_SELECTION:
        if (onLnQTypeSelected) {
          onLnQTypeSelected(lnqType);
          onClose();
          return;
        }

        if (lnqType === WorkListType.PERSONAL) {
          setCurrentStep(Steps.SETUP_RVU);
        } else {
          setCurrentStep(Steps.INITIAL);
        }
        break;

      case Steps.INITIAL:
        if (!groupData?.group?.paymentMethodAttached && groupId) {
          navigate(`${PROVIDER_PAGES.groups}/edit/${groupId}`);
          onClose();
          return;
        }
        setCurrentStep(Steps.SETUP_RVU);
        break;

      case Steps.SETUP_RVU:
        if (rvu <= 0) return;
        setCurrentStep(Steps.CY_PARAMETERS);
        break;

      case Steps.CY_PARAMETERS:
        setCurrentStep(Steps.CY_REPETITION);
        break;

      case Steps.CY_REPETITION:
        setCurrentStep(Steps.SETUP_RVU_LIMITS);
        break;

      case Steps.SETUP_RVU_LIMITS:
        setCurrentStep(Steps.PROVIDERS_LIST);
        break;

      default:
        break;
    }
  }, [
    currentStep,
    lnqType,
    groupId,
    groupData?.group?.paymentMethodAttached,
    rvu,
    navigate,
    onLnQTypeSelected,
    onClose,
  ]);

  // HANDLER FOR CONFIRM
  const handleConfirm = useCallback(() => {
    if (currentStep === Steps.PROVIDERS_LIST) {
      // Only pass groupId if it's a Group LnQ
      const groupIdToUse = lnqType === WorkListType.GROUP ? groupId : undefined;

      const lnqNameToUse = lnqName && lnqName.trim() !== "" ? lnqName : undefined;

      activate({
        distributionType: targetedProviderSettings.targetProviders ? "target" : "open",
        rvu,
        userIDs: targetedProviderSettings.targetProviders
          ? targetedProviderSettings.selectedIds
          : undefined,
        groupId: groupIdToUse,
        dateRange,
        limits,
        repetitionEnabled,
        repetitionSettings,
        lnqName: lnqNameToUse,
      });

      if (targetedProviderSettings.reset) {
        targetedProviderSettings.reset();
      }

      onClose();
    } else {
      handleNextStep();
    }
  }, [
    currentStep,
    lnqType,
    groupId,
    targetedProviderSettings,
    rvu,
    dateRange,
    limits,
    repetitionEnabled,
    repetitionSettings,
    lnqName,
    activate,
    handleNextStep,
    onClose,
  ]);

  // HANDLER FOR CANCEL/CLOSE
  const handleCancel = useCallback(() => {
    if (targetedProviderSettings.reset) {
      targetedProviderSettings.reset();
    }
    onClose();
  }, [onClose, targetedProviderSettings]);

  // BUTTON TEXTS
  const [leftButtonTitle, rightButtonTitle] = useMemo(() => {
    if (currentStep === Steps.LNQ_TYPE_SELECTION) {
      return ["Cancel", "Next"];
    }

    if (currentStep === Steps.INITIAL && !groupData?.group?.paymentMethodAttached) {
      return ["Not Now", "Set Up Payment"];
    }

    return [
      currentStep === Steps.INITIAL ? "No" : "Cancel",
      currentStep === Steps.PROVIDERS_LIST ? "Confirm" : "Next",
    ];
  }, [currentStep, groupData?.group?.paymentMethodAttached]);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <ModalOverlay bg="blackAlpha.500" />
      <ModalContent
        w="500px"
        maxWidth="70vw"
        h="auto"
        p="12"
        my="auto"
        mx="auto"
        borderRadius="3xl"
        bgColor="darkBlue2.800"
      >
        <ModalBody p="0" mb="8">
          {currentStep === Steps.LNQ_TYPE_SELECTION && (
            <LnQTypeStep lnqType={lnqType} setLnqType={handleLnQTypeSelection} />
          )}

          {currentStep === Steps.INITIAL && groupData?.group && (
            <InitialStep
              groupName={groupName ?? groupData?.group?.facilityName}
              paymentMethodAttached={groupData?.group.paymentMethodAttached}
            />
          )}

          {currentStep === Steps.SETUP_RVU && <SetupRVUStep rvu={rvu} setRvu={setRvu} />}

          {currentStep === Steps.CY_PARAMETERS && (
            <CYParametersStep
              dateRangeDidChange={setDateRange}
              group={lnqType === WorkListType.GROUP ? groupData?.group : undefined}
            />
          )}

          {currentStep === Steps.CY_REPETITION && (
            <CYRepetition
              onCHangeLnQName={setLnqName}
              isEnabled={repetitionEnabled}
              settings={repetitionSettings}
              onChangeEnabled={setRepetitionEnabled}
              onChangeSettings={setRepetitionSettings}
              lnqStartDate={dateRange?.start ? new Date(dateRange.start) : undefined}
              lnqName={lnqName}
            />
          )}

          {currentStep === Steps.SETUP_RVU_LIMITS && (
            <SetupCYLimitsStep setLimits={setLimits} />
          )}

          {currentStep === Steps.PROVIDERS_LIST && (
            <ProvidersListStep targetedProviderSettings={targetedProviderSettings} />
          )}
        </ModalBody>

        <ModalFooter justifyContent="space-between" p="0">
          <Button variant="outline" color="white" w="48%" onClick={handleCancel}>
            <Text color="white" fontWeight="700" fontSize="16">
              {leftButtonTitle}
            </Text>
          </Button>

          <Button
            colorScheme="brandYellow"
            w="48%"
            onClick={handleConfirm}
            isDisabled={currentStep === Steps.CY_PARAMETERS && !dateRange}
          >
            <Text color="white" fontWeight="700" fontSize="16">
              {rightButtonTitle}
            </Text>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
