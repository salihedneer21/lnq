import { useState, useEffect } from "react";
import {
  Alert,
  AlertIcon,
  Box,
  Checkbox,
  Input,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";

import {
  useBulkMapStudies,
  useCheckCPTMapping,
  useCreateMappingRequest,
} from "~/api/UnmappedStudyApi";
import ModalContainer from "~/components/ModalContainer/ModalContainer";
import { MappingCheckData, UnmappedStudy, ValidationError } from "~/types/UnmappedStudy";
import { formatShortDate } from "~/utils/dateFormatters";
import { AxiosError } from "axios";

interface MapStudyModalProps {
  study: UnmappedStudy;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
}

type ModalState = "input" | "match_found" | "no_match" | "loading" | "submitting";

export const MapStudyModal = ({
  study,
  isOpen,
  onClose,
  onSuccess,
  groupId,
}: MapStudyModalProps) => {
  const [cptCodes, setCptCodes] = useState("");
  const [modalState, setModalState] = useState<ModalState>("input");
  const [mappingResult, setMappingResult] = useState<MappingCheckData | null>(null);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const checkMapping = useCheckCPTMapping(groupId);
  const createMappingRequest = useCreateMappingRequest(groupId);
  const bulkMapStudies = useBulkMapStudies(groupId);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setCptCodes("");
      setModalState("input");
      setMappingResult(null);
      setAgreementChecked(false);
      setValidationErrors([]);
    }
  }, [isOpen]);

  const formatCptCodes = (input: string) => {
    return input
      .replaceAll(/[^0-9,\s]/g, "") // Remove non-numeric characters except commas and spaces
      .replaceAll(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  };

  const handleCptCodesChange = (value: string) => {
    const formatted = formatCptCodes(value);
    setCptCodes(formatted);

    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleCheckMapping = async () => {
    if (!cptCodes.trim()) return;

    setModalState("loading");
    setValidationErrors([]);

    try {
      const result = await checkMapping.mutateAsync({
        cptCodes: cptCodes
          .split(",")
          .map((code) => code.trim())
          .filter(Boolean),
        facilityName: study.facility,
        procedureCode: study.facilityCode,
      });

      setMappingResult(result.data);
      setModalState(result.data.isValid ? "match_found" : "no_match");
    } catch (error) {
      console.error("Error checking CPT mapping:", error);

      if (error instanceof AxiosError && error.response?.status === 400) {
        const validationError = error.response.data as ValidationError;
        if (validationError.errors && validationError.errors.length > 0) {
          setValidationErrors(validationError.errors);
        } else if (validationError.message) {
          setValidationErrors([validationError.message]);
        }
      }

      setModalState("input");
    }
  };

  const handleConfirmMapping = async () => {
    if (!mappingResult?.matchedExamCode) return;

    setModalState("submitting");

    try {
      await bulkMapStudies.mutateAsync({
        facilityName: study.facility,
        procedureCode: study.facilityCode,
        examCode: mappingResult.matchedExamCode,
      });

      toast({
        title: "Mapping applied",
        description: "The mapping was applied successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error confirming mapping:", error);
      setModalState("match_found");
    }
  };

  const handleSendRequest = async () => {
    setModalState("submitting");
    setValidationErrors([]);

    try {
      await createMappingRequest.mutateAsync({
        facilityName: study.facility,
        procedureCode: study.facilityCode,
        cptCodes: cptCodes
          .split(",")
          .map((code) => code.trim())
          .filter(Boolean),
        orderDescription: study.orderDescription,
      });

      toast({
        title: "Request sent",
        description: "Your mapping request has been submitted.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error sending mapping request:", error);

      // Handle validation errors
      if (error instanceof AxiosError && error.response?.status === 400) {
        const validationError = error.response.data as ValidationError;
        if (validationError.errors && validationError.errors.length > 0) {
          setValidationErrors(validationError.errors);
        } else if (validationError.message) {
          setValidationErrors([validationError.message]);
        }
        setModalState("input");
      } else {
        setModalState("no_match");
      }
    }
  };

  const renderStudyDetails = () => (
    <VStack spacing={4} align="stretch" mb={6}>
      <Box display="flex" justifyContent="space-between">
        <Text textStyle="smBold" color="gray.400" mb={1}>
          Facility Code
        </Text>
        <Text textStyle="smMdSemi" color="white">
          {study.facilityCode}
        </Text>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Text textStyle="smBold" color="gray.400" mb={1}>
          Order Description
        </Text>
        <Text textStyle="smMdSemi">{study.orderDescription}</Text>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Text textStyle="smBold" color="gray.400" mb={1}>
          Facility
        </Text>
        <Text textStyle="smMdSemi">{study.facility}</Text>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <Text textStyle="smBold" color="gray.400" mb={1}>
          Date Finalized
        </Text>
        <Text textStyle="smMdSemi">{formatShortDate(study.dateFinalized)}</Text>
      </Box>
    </VStack>
  );

  const renderInputState = () => (
    <>
      {renderStudyDetails()}
      <VStack spacing={4} align="stretch">
        <Box>
          <Text textStyle="smMdSemi" textAlign="left" color="gray.400" mb={6}>
            Enter the coordinating CPT codes for this study below. If multiple CPT codes
            separate by commas (e.g., 74160,71260)
          </Text>
          <Input
            placeholder="Enter CPT Codes"
            value={cptCodes}
            onChange={(e) => handleCptCodesChange(e.target.value)}
            bg="darkBlue2.900"
            borderColor="gray.600"
            color="white"
            _hover={{ borderColor: "gray.500" }}
            _focus={{ borderColor: "brandYellow.400", boxShadow: "0 0 0 1px #D69E2E" }}
          />
        </Box>
        {cptCodes && !/^[0-9,\s]+$/.test(cptCodes) && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            Please enter valid CPT codes (numbers only, separated by commas)
          </Alert>
        )}
        {validationErrors.length > 0 && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              {validationErrors.map((error) => (
                <Text key={error} fontSize="sm">
                  {error}
                </Text>
              ))}
            </VStack>
          </Alert>
        )}
      </VStack>
    </>
  );

  const renderMatchFoundState = () => (
    <VStack spacing={4} align="stretch">
      <Box textAlign="center">
        <Box display="flex" justifyContent="space-between" my={8}>
          <Text textStyle="smBold" color="gray.400">
            RVU Total
          </Text>
          <Text textStyle="smBold" color="white">
            {mappingResult?.rvuCalculation?.totalRVUs.toFixed(2) ?? "0"}
          </Text>
        </Box>
        <Text textStyle="smMdSemi" textAlign="left" color="gray.400" my={4}>
          This will update{" "}
          <Text as="span" textStyle="smBold" color="white" textDecoration="underline">
            {mappingResult?.rvuCalculation?.studyCount}
          </Text>{" "}
          studies with the same facility code
        </Text>
      </Box>
    </VStack>
  );

  const renderNoMatchState = () => (
    <VStack spacing={4} align="stretch">
      <Text textStyle="smMdSemi" color="gray.400">
        We couldn&apos;t find an internal match for {cptCodes}. By sending a request this
        will create a support ticket for our team to update the mapping. Expected
        turn-around time: 24–48 hrs.
      </Text>
      <Checkbox
        isChecked={agreementChecked}
        onChange={(e) => setAgreementChecked(e.target.checked)}
        colorScheme="yellow"
        size="lg"
      >
        <Text textStyle="smMdSemi">I&apos;ve double-checked the CPT codes above.</Text>
      </Checkbox>
    </VStack>
  );

  const renderLoadingState = () => (
    <VStack spacing={6} py={8}>
      <Spinner size="xl" color="brandYellow.400" />
      <Text textStyle="smMdSemi">Checking CPT mapping...</Text>
    </VStack>
  );

  const renderSubmittingState = () => (
    <VStack spacing={6} py={8}>
      <Spinner size="xl" color="brandYellow.400" />
      <Text textStyle="smMdSemi">Submitting...</Text>
    </VStack>
  );

  const getModalContent = () => {
    switch (modalState) {
      case "input":
        return renderInputState();
      case "match_found":
        return renderMatchFoundState();
      case "no_match":
        return renderNoMatchState();
      case "loading":
        return renderLoadingState();
      case "submitting":
        return renderSubmittingState();
      default:
        return renderInputState();
    }
  };

  const getModalProps = () => {
    const baseProps = {
      isOpen,
      onClose,
      leftButtonTitle: "Cancel",
    };
    switch (modalState) {
      case "input":
        return {
          title: "Map Study",
          ...baseProps,
          rightButtonTitle: "Check Mapping",
          onClickLeftButton: onClose,
          onClickRightButton: handleCheckMapping,
          rightButtonEnabled: Boolean(
            cptCodes.trim() &&
              /^[0-9,\s]+$/.test(cptCodes) &&
              validationErrors.length === 0,
          ),
        };
      case "match_found":
        return {
          title: `Match Found For ${cptCodes}`,
          ...baseProps,
          rightButtonTitle: "Confirm Mapping",
          onClickLeftButton: () => setModalState("input"),
          onClickRightButton: handleConfirmMapping,
        };
      case "no_match":
        return {
          title: "Submit CPT set to LnQ team?",
          ...baseProps,
          rightButtonTitle: "Send Request",
          onClickLeftButton: () => setModalState("input"),
          onClickRightButton: handleSendRequest,
          rightButtonEnabled: agreementChecked,
        };
      case "loading":
      case "submitting":
        return {
          title: modalState === "loading" ? "Map Study" : "Submitting...",
          ...baseProps,
          rightButtonTitle: "Loading...",
          onClickLeftButton: onClose,
          rightButtonEnabled: false,
          hideFooter: false,
        };
      default:
        return {
          title: "Map Study",
          ...baseProps,
          rightButtonTitle: "Close",
          onClickLeftButton: onClose,
          onClickRightButton: onClose,
        };
    }
  };

  return <ModalContainer {...getModalProps()}>{getModalContent()}</ModalContainer>;
};

export default MapStudyModal;
