import React, { useCallback, useEffect, useState } from "react";
import { FiArrowLeft, FiPlus, FiRefreshCw, FiUserPlus } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, HStack, Text, useToast, VStack } from "@chakra-ui/react";

import { useGetGroup, useLeaveGroup, useSyncGroupSchedule } from "../../api/GroupApi";
import { useInviteUserToGroup } from "../../api/GroupProviderApi";
import { PROVIDER_PAGES } from "../../base/router/pages";
import { CYModal } from "../../components/CYModal/CYModal";
import { GroupBalanceView } from "../../components/GroupBalanceView/GroupBalanceView";
import { InviteRADModal } from "../../components/InviteRadModal/InviteRADModal.tsx";
import TemporaryPasswordModal from "../../components/InviteRadModal/TemporaryPasswordModal.tsx";
import { StyledTabBar } from "../../components/StyledTabBar/StyledTabBar";
import { useLnqRights } from "../../hooks/lnq/useLnqRights.ts";
import { useHandleModal } from "../../hooks/useHandleModal";
import { WorkListType } from "../../types/Worklist";
import { timeZoneFullNames } from "../../utils/timeZones";
import AdminCompletedStudiesTable from "./components/AdminCompletedStudiesTable/AdminCompletedStudiesTable";
import CPTSettings from "./components/CPTSettings.tsx";
import { GroupRepeatingLnQsTable } from "./components/GroupRepeatingLnQsTable.tsx";
import { RepetitionSettings } from "../../types/Repetition.ts";
import CYAlertsTable from "./components/CYAlertsTable/CYAlertsTable";
import { ProvidersTable } from "./components/ProvidersTable";
import SummaryReport from "./components/SummaryReport";
import { useCreateLnQ } from "../../hooks/useCreateLnQ";
import UnmappedStudiesTable from "./components/UnmappedStudiesTable/UnmappedStudiesTable";

export const GroupDetailsPage = () => {
  const navigate = useNavigate();
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId ?? "";
  const { data } = useGetGroup(groupId);
  const { mutate: leaveGroup } = useLeaveGroup();
  const handleModal = useHandleModal();
  const [groupTimeZone, setGroupTimeZone] = useState("");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const { createLnQ } = useCreateLnQ();
  const { mutate: syncSchedule, status: syncStatus } = useSyncGroupSchedule(groupId);
  const toast = useToast();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTemporaryPasswordModalOpen, setIsTemporaryPasswordModalOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const { mutateAsync: inviteProvider } = useInviteUserToGroup();

  const [activeTab, setActiveTab] = useState("providers");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  const { hasLnqRights } = useLnqRights();

  useEffect(() => {
    const updateTime = () => {
      if (data?.group?.timeZone) {
        const fullTimeZoneName = timeZoneFullNames[data.group.timeZone];
        setGroupTimeZone(`${fullTimeZoneName}`);
      }
    };

    updateTime();
    const ONE_MINUTE_MS = 60000;
    const timer = setInterval(updateTime, ONE_MINUTE_MS);

    return () => clearInterval(timer);
  }, [data?.group?.timeZone]);

  const navigateBack = () => {
    navigate(PROVIDER_PAGES.groups);
  };

  const leaveThisGroup = () => {
    if (groupId) {
      leaveGroup(groupId);
      navigateBack();
    }
  };

  const handleOpenInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
  };

  const handleInviteConfirm = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    npi: string;
  }) => {
    try {
      const response = await inviteProvider({
        groupId: groupId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        npi: data.npi,
      });

      if (response.password) {
        setTemporaryPassword(response.password);
        setIsTemporaryPasswordModalOpen(true);
      }

      toast({
        title: "Invitation Sent",
        description: "The provider has been successfully invited.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      handleCloseInviteModal();
    } catch (error: unknown) {
      toast({
        title: "Error Inviting Provider",
        description:
          error instanceof Error ? error.message : "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const handleCloseTemporaryPasswordModal = () => {
    setIsTemporaryPasswordModalOpen(false);
  };

  const tappedLeaveGroup = (_e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    handleModal({
      title: "Are you sure you want to leave this group?",
      leftButtonTitle: "Cancel",
      rightButtonTitle: "Confirm",
      onClickRightButton: () => {
        leaveThisGroup();
      },
    });
  };

  const navigateToEditGroup = () => {
    navigate(`${PROVIDER_PAGES.groups}/edit/${groupId}`);
  };

  const handleAddCodeYellow = useCallback(() => {
    setIsGroupModalOpen(true);
  }, []);

  const handleGoToSchedule = () => {
    navigate(`${PROVIDER_PAGES.schedule.replace(":groupId?", groupId ?? "")}`);
  };

  const handleActivateCodeYellow = useCallback(
    (opts: {
      distributionType: "open" | "target";
      rvu: number;
      userIDs?: string[];
      groupId?: string;
      dateRange?: { start: string; end?: string };
      limits?: { amountLimit?: number; RVUsLimit?: number };
      repetitionEnabled?: boolean;
      repetitionSettings?: RepetitionSettings;
      lnqName?: string;
    }) => {
      const {
        distributionType,
        rvu,
        userIDs,
        groupId,
        dateRange,
        limits,
        repetitionEnabled,
        repetitionSettings,
        lnqName,
      } = opts;

      if (!groupId || !data?.group?.worklistId) {
        console.error("Missing groupId or worklistId");
        toast({
          title: "Error Creating LnQ",
          description: "Missing required information to create LnQ.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsGroupModalOpen(false);
        return;
      }

      createLnQ(
        {
          worklistId: data.group.worklistId,
          distributionType,
          usdPerRvu: rvu,
          userIDs,
          groupId,
          dateRange,
          limits,
          repetitionEnabled,
          repetitionSettings,
          lnqName,
        },
        {
          onSuccess: () => {
            setIsGroupModalOpen(false);
          },
          onError: () => {
            setIsGroupModalOpen(false);
          },
        },
      );
    },
    [createLnQ, data?.group?.worklistId, setIsGroupModalOpen, toast],
  );

  const handleSyncSchedule = useCallback(() => {
    if (typeof groupId !== "string") return;

    syncSchedule(undefined, {
      onSuccess: () => {
        toast({
          title: "Schedule Synced",
          description: "The schedule has been successfully synced.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error Syncing Schedule",
          description: error.message || "An unexpected error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    });
  }, [groupId, syncSchedule, toast]);

  return (
    <>
      <Box mt={"24px"} mb={"10px"}>
        <HStack justify={"space-between"}>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="link"
            onClick={navigateBack}
            color="white"
          >
            My Groups
          </Button>
          {data?.isAdmin ? (
            <HStack>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="yellow"
                variant="solid"
                onClick={handleAddCodeYellow}
                isDisabled={!hasLnqRights}
              >
                Create LnQ
              </Button>
              <Button
                variant="outline"
                colorScheme="brandYellow"
                onClick={handleGoToSchedule}
              >
                View Schedule
              </Button>
              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                colorScheme="brandYellow"
                onClick={handleSyncSchedule}
                isDisabled={syncStatus === "pending"}
                isLoading={syncStatus === "pending"}
              >
                Sync Schedule
              </Button>
              <Button
                leftIcon={<FiUserPlus />}
                variant="outline"
                colorScheme="brandYellow"
                onClick={handleOpenInviteModal}
              >
                Invite
              </Button>
              <Button
                variant="outline"
                colorScheme="brandYellow"
                onClick={navigateToEditGroup}
              >
                Edit Group
              </Button>
              {/*<GroupTargetedPaymentSwitch group={data.group} />*/}
            </HStack>
          ) : (
            <HStack>
              <Button
                variant="outline"
                colorScheme="brandYellow"
                onClick={handleGoToSchedule}
              >
                View Schedule
              </Button>
              <Button
                variant="outline"
                colorScheme="brandYellow"
                onClick={tappedLeaveGroup}
              >
                Leave Group
              </Button>
            </HStack>
          )}
        </HStack>
        <VStack align="start" spacing={0}>
          <Text fontSize="3xl" fontWeight="700" color="white">
            {data?.group?.facilityName}
          </Text>
          <Text fontSize="16px" color="gray.500">
            {data?.group?.description}
          </Text>
          <Text fontSize="16px" color="gray.500">
            {groupTimeZone}
          </Text>
        </VStack>
      </Box>
      <StyledTabBar
        selectedTab={activeTab}
        onChange={handleTabChange}
        size="lg"
        tabList={[
          { value: "providers", label: "Providers" },
          ...(data?.isAdmin
            ? [
                { value: "completedStudies", label: "Completed Studies" },
                { value: "cyAlerts", label: "LnQ Alerts" },
                { value: "balance", label: "Balance" },
                { value: "summaryReport", label: "Summary Report" },
                { value: "repeatingLnqs", label: "Repeating LnQs" },
                { value: "cptSettings", label: "CPT Settings" },
                { value: "unmappedStudies", label: "Unmapped Studies" },
              ]
            : []),
        ]}
        tabPanels={[
          ...(data?.group
            ? [
                <ProvidersTable
                  key="providers"
                  group={data?.group}
                  isGroupAdmin={data?.isAdmin}
                />,
              ]
            : []),
          ...(data?.isAdmin
            ? [
                <AdminCompletedStudiesTable
                  groupId={groupId}
                  groupName={data?.group?.facilityName}
                  key="completedStudies"
                />,
                <CYAlertsTable groupId={groupId} key="cyAlerts" />,
                <GroupBalanceView groupId={groupId} key="balance" />,
                <SummaryReport groupId={groupId} key="summaryReport" />,
                <GroupRepeatingLnQsTable groupId={groupId} key="repeatingLnqs" />,
                <CPTSettings groupId={groupId} key="cptSettings" />,
                <UnmappedStudiesTable
                  groupId={groupId}
                  key="unmappedStudies"
                  isActive={activeTab === "unmappedStudies"}
                />,
              ]
            : []),
        ]}
      />
      <CYModal
        type={WorkListType.GROUP}
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        activate={handleActivateCodeYellow}
        groupName={data?.group?.facilityName}
        groupId={groupId}
      />
      <InviteRADModal
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
        onConfirm={handleInviteConfirm}
      />
      <TemporaryPasswordModal
        isOpen={isTemporaryPasswordModalOpen}
        onClose={handleCloseTemporaryPasswordModal}
        temporaryPassword={temporaryPassword}
        isReset={false}
      />
    </>
  );
};
