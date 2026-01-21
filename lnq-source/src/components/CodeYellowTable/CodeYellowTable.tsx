import React, { useCallback, useState, useEffect } from "react";
import { Box, Center, Spinner, Text, Th, Tr, useDisclosure } from "@chakra-ui/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {
  useDeactivateCodeYellow,
  useGetMyActiveCodeYellows,
  useGetMyActiveTargetedCodeYellows,
  useGetMyScheduledCodeYellows,
  useGetMyScheduledTargetedCodeYellows,
} from "../../api/CodeYellowApi";
import { CodeYellowResponse } from "../../types/CodeYellowResponse";
import { getShortAbbreviationOfTimezone } from "../../utils/dateFormatters";
import { getUserTimeZone } from "../../utils/timeZones";
import EditCodeYellowModal from "../CYModal/EditCodeYellowModal";
import ModalContainer from "../ModalContainer/ModalContainer";
import { Pagination } from "../Pagination/Pagination";
import { StyledTabBar } from "../StyledTabBar/StyledTabBar";
import { StyledTable } from "../StyledTable/StyledTable";
import TargetedProvidersModal from "../TargetedProvidersModal/TargetedProvidersModal";
import CodeYellowRow from "./CodeYellowRow";

dayjs.extend(utc);

export type LnQTab = "active" | "scheduled" | "mylnqs";

const isLnQTab = (value: string): value is LnQTab => {
  return value === "active" || value === "scheduled" || value === "mylnqs";
};

interface TabDef {
  value: LnQTab;
  label: string;
}
const TAB_LIST: TabDef[] = [
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "mylnqs", label: "My LnQs" },
];

const COL_GROUPS = (
  <colgroup>
    <col span={1} style={{ width: "5%" }} />
    <col span={1} style={{ width: "24%" }} />
    <col span={1} style={{ width: "24%" }} />
    <col span={1} style={{ width: "5%" }} />
    <col span={1} style={{ width: "5%" }} />
    <col span={1} style={{ width: "4%" }} />
    <col span={1} style={{ width: "8%" }} />
    <col span={1} style={{ width: "8%" }} />
    <col span={1} style={{ width: "8%" }} />
    <col span={1} style={{ width: "8%" }} />
    <col span={1} style={{ width: "5%" }} />
    <col span={1} style={{ width: "1%" }} />
  </colgroup>
);

const HEADER_COLUMNS = (
  <Tr h="16" mb="1">
    <Th key="targeted">Targeted</Th>
    <Th key="startDate">Start Date</Th>
    <Th key="endDate">End Date</Th>
    <Th key="worklist">Worklist</Th>
    <Th key="pendingStudyCount" whiteSpace="normal">
      Pending Studies
    </Th>
    <Th key="respondingProvidersCount" whiteSpace="normal">
      Responding Providers
    </Th>
    <Th
      key="usdPerRvu"
      color="gray.500"
      position="relative"
      bg="brandBlue.900"
      pl="4"
      borderLeftRadius="2xl"
    >
      <Box height="1px" w="100%" bg="gray.600" position="absolute" top="7" zIndex={2} />
      $/RVU
    </Th>
    <Th key="rvusTotal" color="gray.500" position="relative" bg="brandBlue.900">
      <Box height="1px" w="100%" bg="gray.600" position="absolute" top="7" zIndex={2} />
      <Text
        color="gray.600"
        letterSpacing="0"
        position="absolute"
        top="2"
        pl="50%"
        zIndex={2}
        whiteSpace="nowrap"
        textAlign="center"
      >
        LnQ PARAMETERS
      </Text>
      RVUS
    </Th>
    <Th key="rvusLimit" position="relative" bg="brandBlue.900">
      <Box height="1px" w="100%" bg="gray.600" position="absolute" top="7" zIndex={2} />
      <Box color="gray.500" letterSpacing="0" whiteSpace="nowrap">
        <Box color="gray.600" letterSpacing="0" fontSize="0.5rem" lineHeight="1">
          Thresholds
        </Box>
        Total RVU
      </Box>
    </Th>
    <Th
      key="amountLimit"
      position="relative"
      bg="brandBlue.900"
      borderRightRadius="2xl"
      pr="4"
    >
      <Box height="1px" bg="gray.600" mb="0.45rem" top="7" />
      <Box color="gray.500" letterSpacing="0" whiteSpace="nowrap">
        <Box color="gray.600" letterSpacing="0" fontSize="0.5rem" lineHeight="1">
          Thresholds
        </Box>
        Total $
      </Box>
    </Th>
    <Th pl="6" key="Availability">
      Availability
    </Th>
    <Th key="actions" p="0" textAlign="right"></Th>
  </Tr>
);

export const CodeYellowTable: React.FC = () => {
  const [activePage, setActivePage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);
  const [activeTargetedPage, setActiveTargetedPage] = useState(1);
  const [scheduledTargetedPage, setScheduledTargetedPage] = useState(1);
  const perPage = 10;

  const [currentActiveTab, setCurrentActiveTab] = useState<LnQTab>("active");

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [actionType, setActionType] = useState<"cancel" | "deactivate">();
  const [currentCodeYellowId, setCurrentCodeYellowId] = useState<string | null>(null);
  const [
    targetedCodeYellowProvidersWithAvailabilityModalOpen,
    setTargetedCodeYellowProvidersWithAvailabilityModalOpen,
  ] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCodeYellow, setSelectedCodeYellow] = useState<CodeYellowResponse | null>(
    null,
  );

  const {
    data: activeData,
    isLoading: activeLoading,
    refetch: refetchActive,
  } = useGetMyActiveCodeYellows(activePage, perPage);

  const {
    data: scheduledData,
    isLoading: scheduledLoading,
    refetch: refetchScheduled,
  } = useGetMyScheduledCodeYellows(scheduledPage, perPage);

  const {
    data: activeTargetedData,
    isLoading: activeTargetedLoading,
    refetch: refetchActiveTargeted,
  } = useGetMyActiveTargetedCodeYellows(activeTargetedPage, perPage);

  const {
    data: scheduledTargetedData,
    isLoading: scheduledTargetedLoading,
    refetch: refetchScheduledTargeted,
  } = useGetMyScheduledTargetedCodeYellows(scheduledTargetedPage, perPage);

  const { mutate: deactivateCodeYellow } = useDeactivateCodeYellow();

  const userTimeZone = getUserTimeZone();
  const userTimeZoneAbbreviation = getShortAbbreviationOfTimezone(userTimeZone);

  const handleOpenModal = useCallback(
    (type: "cancel" | "deactivate", codeYellowId: string) => {
      setActionType(type);
      setCurrentCodeYellowId(codeYellowId);
      onModalOpen();
    },
    [onModalOpen],
  );

  const handleConfirmAction = useCallback(() => {
    if (currentCodeYellowId) {
      deactivateCodeYellow({ codeYellowId: currentCodeYellowId });
      setCurrentCodeYellowId(null);
      setSelectedCodeYellow(null);
      setIsEditModalOpen(false);
      setTargetedCodeYellowProvidersWithAvailabilityModalOpen(false);
    }
    onModalClose();
  }, [currentCodeYellowId, deactivateCodeYellow, onModalClose]);

  const handleEdit = useCallback((codeYellow: CodeYellowResponse) => {
    setSelectedCodeYellow(codeYellow);
    setIsEditModalOpen(true);
  }, []);

  const openTargetedProvidersModal = useCallback((codeYellow: CodeYellowResponse) => {
    setCurrentCodeYellowId(codeYellow.id);
    setTargetedCodeYellowProvidersWithAvailabilityModalOpen(true);
  }, []);

  const handleClose = () => {
    setCurrentCodeYellowId(null);
    setTargetedCodeYellowProvidersWithAvailabilityModalOpen(false);
  };

  const handleTabChange = useCallback(
    (selectedTabValue: string) => {
      if (!isLnQTab(selectedTabValue)) {
        return;
      }
      setCurrentActiveTab(selectedTabValue);
      switch (selectedTabValue) {
        case "active":
          setActivePage(1);
          refetchActive();
          break;
        case "scheduled":
          setScheduledPage(1);
          refetchScheduled();
          break;
        case "mylnqs":
          setActiveTargetedPage(1);
          setScheduledTargetedPage(1);
          refetchActiveTargeted();
          refetchScheduledTargeted();
          break;
        default:
          break;
      }
    },
    [
      refetchActive,
      refetchScheduled,
      refetchActiveTargeted,
      refetchScheduledTargeted,
      setActivePage,
      setScheduledPage,
      setActiveTargetedPage,
      setScheduledTargetedPage,
    ],
  );

  useEffect(() => {
    const handleWindowFocus = () => {
      switch (currentActiveTab) {
        case "active":
          refetchActive();
          break;
        case "scheduled":
          refetchScheduled();
          break;
        case "mylnqs":
          refetchActiveTargeted();
          refetchScheduledTargeted();
          break;
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [
    currentActiveTab,
    refetchActive,
    refetchScheduled,
    refetchActiveTargeted,
    refetchScheduledTargeted,
  ]);

  const groupRow = useCallback(
    (row: CodeYellowResponse) => (
      <CodeYellowRow
        key={row.id}
        codeYellow={row}
        userTimeZoneAbbreviation={userTimeZoneAbbreviation}
        onEditClick={handleEdit}
        onMenuItemClick={handleOpenModal}
        onProvidersClick={openTargetedProvidersModal}
      />
    ),
    [userTimeZoneAbbreviation, handleEdit, handleOpenModal, openTargetedProvidersModal],
  );

  return (
    <>
      <Text fontSize="xl" fontWeight="bold" mb={4} color="White" opacity={1}>
        LnQs
      </Text>
      <StyledTabBar
        size="lg"
        tabList={TAB_LIST}
        tabPanels={[
          <Box key="active" p={4} mt={6}>
            <Text fontSize="xl" fontWeight="bold" mb={4} color="White" opacity={1}>
              {activeData?.totalItems ?? 0} Active
            </Text>
            {activeLoading ? (
              <Center>
                <Spinner size="lg" />
              </Center>
            ) : (
              <>
                <StyledTable
                  columns={[]}
                  colGroups={COL_GROUPS}
                  headerColumns={HEADER_COLUMNS}
                  data={activeData?.docs ?? []}
                  customRowRenderers={groupRow}
                  loading={activeLoading}
                />
                <Pagination
                  pages={activeData?.totalPages ?? 1}
                  currentPage={activePage}
                  setPage={setActivePage}
                />
              </>
            )}
          </Box>,
          <Box key="scheduled" p={4} mt={6}>
            <Text fontSize="xl" fontWeight="bold" mb={4} color="White" opacity={1}>
              {scheduledData?.totalItems ?? 0} Scheduled
            </Text>
            {scheduledLoading ? (
              <Center>
                <Spinner size="lg" />
              </Center>
            ) : (
              <>
                <StyledTable
                  columns={[]}
                  colGroups={COL_GROUPS}
                  data={scheduledData?.docs ?? []}
                  headerColumns={HEADER_COLUMNS}
                  customRowRenderers={groupRow}
                  loading={scheduledLoading}
                />
                <Pagination
                  pages={scheduledData?.totalPages ?? 1}
                  currentPage={scheduledPage}
                  setPage={setScheduledPage}
                />
              </>
            )}
          </Box>,
          <Box key="mylnqs" p={4} mt={6}>
            {activeTargetedData?.totalItems === 0 &&
            scheduledTargetedData?.totalItems === 0 ? (
              <Text fontSize="16px" fontWeight="700" color="White">
                You are not currently targeted for any LnQs. View &quot;Active&quot; or
                &quot;Scheduled&quot; for more details.
              </Text>
            ) : (
              <>
                <Text fontSize="xl" fontWeight="bold" mb={4} color="White" opacity={1}>
                  {activeTargetedData?.totalItems ?? 0} Active Targeted
                </Text>
                {activeTargetedLoading ? (
                  <Center>
                    <Spinner size="lg" />
                  </Center>
                ) : (
                  <>
                    <StyledTable
                      columns={[]}
                      colGroups={COL_GROUPS}
                      headerColumns={HEADER_COLUMNS}
                      data={activeTargetedData?.docs ?? []}
                      customRowRenderers={groupRow}
                      loading={activeTargetedLoading}
                    />
                    <Pagination
                      pages={activeTargetedData?.totalPages ?? 1}
                      currentPage={activeTargetedPage}
                      setPage={setActiveTargetedPage}
                    />
                  </>
                )}

                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  mb={4}
                  mt={8}
                  color="White"
                  opacity={1}
                >
                  {scheduledTargetedData?.totalItems ?? 0} Scheduled Targeted
                </Text>
                {scheduledTargetedLoading ? (
                  <Center>
                    <Spinner size="lg" />
                  </Center>
                ) : (
                  <>
                    <StyledTable
                      columns={[]}
                      colGroups={COL_GROUPS}
                      headerColumns={HEADER_COLUMNS}
                      data={scheduledTargetedData?.docs ?? []}
                      customRowRenderers={groupRow}
                      loading={scheduledTargetedLoading}
                    />
                    <Pagination
                      pages={scheduledTargetedData?.totalPages ?? 1}
                      currentPage={scheduledTargetedPage}
                      setPage={setScheduledTargetedPage}
                    />
                  </>
                )}
              </>
            )}
          </Box>,
        ]}
        onChange={handleTabChange}
      />
      <ModalContainer
        isOpen={isModalOpen}
        onClose={onModalClose}
        onClickLeftButton={onModalClose}
        onClickRightButton={handleConfirmAction}
        title={
          actionType === "cancel"
            ? "Are you sure you want to cancel this LnQ alert?"
            : "Are you sure you want to deactivate this LnQ alert?"
        }
        leftButtonTitle="Cancel"
        rightButtonTitle="Confirm"
      />
      {isEditModalOpen && selectedCodeYellow && (
        <EditCodeYellowModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          codeYellow={selectedCodeYellow}
        />
      )}
      <TargetedProvidersModal
        codeYellowId={currentCodeYellowId}
        isOpen={targetedCodeYellowProvidersWithAvailabilityModalOpen}
        onClose={handleClose}
      />
    </>
  );
};
