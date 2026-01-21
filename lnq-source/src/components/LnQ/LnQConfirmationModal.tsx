import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Text,
  Flex,
  Divider,
} from "@chakra-ui/react";
import type { CodeYellowResponse } from "../../types/CodeYellowResponse";
import dayjs from "dayjs";
import { useUserData } from "../../api/UserApi";
import { getUserTimeZone } from "../../utils/timeZones";

import TargetedProvidersModal from "../TargetedProvidersModal/TargetedProvidersModal";
import { DistributionType } from "~/types/CodeYellow";
import { getShortAbbreviationOfTimezone } from "~/utils/dateFormatters";

interface LnQConfirmationModalProps {
  lnq: CodeYellowResponse | null;
  isOpen: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}

export const LnQConfirmationModal = ({
  lnq,
  isOpen,
  onConfirm,
  onDecline,
}: LnQConfirmationModalProps) => {
  const targetedProvidersCount =
    lnq?.distributionType === DistributionType.OPEN
      ? lnq?.groupProvidersCount
      : lnq?.targetedProvidersCount ?? 0;
  const respondingProvidersCount = lnq?.respondingProvidersCount ?? 0;
  const [isTargetedProvidersModalOpen, setIsTargetedProvidersModalOpen] = useState(false);
  const { data: currentUser, refetch: refetchUserData } = useUserData();

  const userTimeZone = getUserTimeZone();
  const userTimeZoneAbbreviation = getShortAbbreviationOfTimezone(userTimeZone);

  useEffect(() => {
    if (isOpen) {
      refetchUserData();
    }
  }, [isOpen, refetchUserData]);

  if (!lnq || !currentUser) return null;

  const hasUserResponded = lnq.userResponded;

  if (hasUserResponded) {
    return null;
  }

  const outlineButtonProps = {
    variant: "outline",
    borderColor: "brandYellow.600",
    color: "brandYellow.600",
    borderRadius: "full",
    fontWeight: "normal",
    _hover: { bg: "darkBlue2.800" },
    height: "32px",
    px: 6,
  };

  const formatDateTimeWithUserTimeZone = (dateString: string | Date | null) => {
    if (!dateString) return "";
    return (
      dayjs(dateString).format("MM/DD/YYYY, hh:mma") + `\n(${userTimeZoneAbbreviation})`
    );
  };

  const handleConfirm = () => {
    onConfirm();
    setIsTargetedProvidersModalOpen(false);
  };

  const handleDecline = () => {
    onDecline();
    setIsTargetedProvidersModalOpen(false);
  };

  return (
    <Modal isOpen={isOpen && !hasUserResponded} onClose={onDecline} isCentered size="lg">
      <ModalOverlay />
      <ModalContent
        bg="darkBlue2.800"
        borderRadius="2xl"
        p={{ base: 4, md: 6 }}
        maxW="520px"
      >
        <ModalHeader
          textAlign="center"
          color="white"
          fontSize="2xl"
          fontWeight="bold"
          pb={0}
          pt={4}
        >
          <Text
            color="whiteAlpha.900"
            fontWeight={700}
            fontSize={24}
            lineHeight={"28px"}
            maxW={300}
            mx="auto"
          >
            Are you available for the following LnQ?
          </Text>
        </ModalHeader>

        <ModalBody pt={8} pb={4}>
          <Box bg="darkBlue2.900" borderRadius="xl" p={4} color="white">
            <Flex direction="column" gap={2}>
              {/* Main Info Section */}
              <Flex justify="flex-start" gap={4} align="flex-start">
                {/* Left Column - Labels */}
                <Flex direction="column" gap={4} minW="160px">
                  <Box>
                    <Text pt={2} color="white" fontSize="14" fontWeight={700}>
                      {lnq.distributionType === DistributionType.TARGET
                        ? `${lnq.group?.facilityName}`
                        : lnq.group?.facilityName}
                    </Text>
                    <Text mt={4} color="whiteAlpha.700" fontWeight={500} fontSize="12">
                      End Time
                    </Text>
                  </Box>
                  <Text color="whiteAlpha.700" fontWeight={500} fontSize="12"></Text>
                  <Text color="whiteAlpha.700" fontWeight={500} fontSize="12">
                    Targeted Providers
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="12" mt={2}>
                    Responding Providers
                  </Text>
                </Flex>

                {/* Right Column - Values */}
                <Flex direction="column" align="flex-start">
                  <Box textAlign="left">
                    <Text pb={1} color="whiteAlpha.800" fontSize="12">
                      {formatDateTimeWithUserTimeZone(lnq.startTime)}
                    </Text>
                    <Text color="whiteAlpha.800" fontSize="12"></Text>
                    <Text color="whiteAlpha.800" fontSize="12">
                      {lnq.endTime
                        ? formatDateTimeWithUserTimeZone(lnq.endTime)
                        : "No end time"}
                    </Text>
                  </Box>
                  <Box textAlign="left">
                    <Button
                      fontSize="12"
                      mt={3}
                      {...outlineButtonProps}
                      onClick={() => setIsTargetedProvidersModalOpen(true)}
                    >
                      {targetedProvidersCount} Providers
                    </Button>
                    <br />
                    <Button
                      fontSize="12"
                      mt={3}
                      {...outlineButtonProps}
                      onClick={() => setIsTargetedProvidersModalOpen(true)}
                    >
                      {respondingProvidersCount} Providers
                    </Button>
                  </Box>
                </Flex>
              </Flex>

              <Divider borderColor="gray.300" my={4} />

              {/* Targeted Providers Modal */}
              <TargetedProvidersModal
                codeYellowId={lnq.id}
                isOpen={isTargetedProvidersModalOpen}
                onClose={() => setIsTargetedProvidersModalOpen(false)}
                showSwitch={true}
              />

              {/* LNQ Parameters Section */}
              <Text
                color="whiteAlpha.600"
                fontSize="sm"
                textAlign="center"
                fontWeight="500"
              >
                LNQ PARAMETERS
              </Text>

              <Flex justify="flex-start" gap={2} align="flex-start">
                {/* Left Column - Parameter Labels */}
                <Flex direction="column" gap={2} minW="160px">
                  <Text fontWeight={700} color="whiteAlpha.700" fontSize="12">
                    $/RVU
                  </Text>
                  <Text fontWeight={700} color="whiteAlpha.700" fontSize="12">
                    RVUs
                  </Text>
                  <Box>
                    <Text color="whiteAlpha.600" fontSize="12">
                      Thresholds
                    </Text>
                    <Text fontWeight={700} color="whiteAlpha.700" fontSize="12">
                      Total RVU
                    </Text>
                  </Box>
                  <Box>
                    <Text color="whiteAlpha.600" fontSize="xs">
                      Thresholds
                    </Text>
                    <Text fontWeight={700} color="whiteAlpha.700" fontSize="12">
                      Total $
                    </Text>
                  </Box>
                </Flex>

                {/* Right Column - Parameter Values */}
                <Flex direction="column" gap={1.5} align="flex-start">
                  <Text textAlign="left" color="white" fontSize="12">
                    {(lnq.usdPerRvu ?? 0).toFixed(2)}
                  </Text>
                  <Text textAlign="left" color="white" fontSize="12">
                    {(lnq.lnqPayableRVUs ?? 0).toFixed(2)}
                  </Text>
                  <Flex flexDirection="column" gap={8} mt={4}>
                    <Text textAlign="left" color="white" fontSize="12">
                      {(lnq.rvusLimit ?? 0).toFixed(2)}
                    </Text>
                    <Text textAlign="left" color="white" fontSize="12">
                      {(lnq.amountLimit ?? 0).toFixed(2)}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Box>
        </ModalBody>

        <ModalFooter pb={8} pt={6}>
          <Flex w="100%" gap={4}>
            <Button
              flex={1}
              variant="outline"
              color="white"
              borderColor="white"
              onClick={handleDecline}
              _hover={{ bg: "whiteAlpha.100" }}
              borderRadius="12px"
              h="56px"
              fontSize="lg"
              fontWeight="600"
            >
              No
            </Button>
            <Button
              flex={1}
              bg="brandYellow.600"
              color="darkBlue2.800"
              onClick={handleConfirm}
              _hover={{ bg: "brandYellow.500" }}
              borderRadius="12px"
              h="56px"
              fontSize="lg"
              fontWeight="600"
            >
              Yes
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
