import dayjs from "dayjs";
import React, { useCallback, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";

import {
  useDeactivateCodeYellow,
  useGetAdminGroupCodeYellowRecords,
} from "~/api/CodeYellowApi";
import EditCodeYellowModal from "~/components/CYModal/EditCodeYellowModal";
import DateRangePicker from "~/components/DateRangePicker/DateRangePicker";
import ModalContainer from "~/components/ModalContainer/ModalContainer";
import { Pagination } from "~/components/Pagination/Pagination";
import { StickyTableContainer } from "~/components/StyledTable/StickyTableContainer";
import TargetedProvidersModal from "~/components/TargetedProvidersModal/TargetedProvidersModal";
import { CodeYellow, DistributionType } from "~/types/CodeYellow";
import { CYAlertRecord } from "~/types/CYAlertRecord";
import { WorkList, WorkListType } from "~/types/Worklist";
import { getTimeZoneAbbreviation, getUserTimeZone } from "~/utils/timeZones";
import { CodeYellowResponse } from "~/types/CodeYellowResponse";

import ProviderPayableStudiesTable from "./ProviderPayableStudiesTable";

interface Props {
  groupId: string;
}

interface TableColumn {
  key: keyof CYAlertRecord | "action";
  label: string;
}

const CYAlertsTable: React.FC<Props> = ({ groupId }) => {
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [datesFilter, setDatesFilter] = useState<Date[]>([
    dayjs().startOf("month").toDate(),
    dayjs().endOf("day").toDate(),
  ]);

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [actionType, setActionType] = useState<"cancel" | "deactivate">();
  const [currentCodeYellowId, setCurrentCodeYellowId] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCodeYellow, setSelectedCodeYellow] = useState<CodeYellow | null>(null);

  const [targetedProvidersModalOpen, setTargetedProvidersModalOpen] = useState(false);
  const [selectedCodeYellowId, setSelectedCodeYellowId] = useState<string | null>(null);
  const [showSwitch, setShowSwitch] = useState(false);

  const [selectedCodeYellowForStudies, setSelectedCodeYellowForStudies] = useState<
    string | null
  >(null);

  const { data, isLoading } = useGetAdminGroupCodeYellowRecords(
    page,
    perPage,
    groupId,
    datesFilter,
  );

  const paginationInfo = data
    ? `Showing ${(page - 1) * perPage + 1}-${Math.min(
        page * perPage,
        data.totalItems,
      )} of ${data.totalItems} results`
    : "";

  const { mutate: deactivateCodeYellow } = useDeactivateCodeYellow();

  const tableColumns: TableColumn[] = [
    { key: "action", label: "" }, // Chevron column
    { key: "startTime", label: "Start Time" },
    { key: "endTime", label: "End Time" },
    { key: "activatedBy", label: "Activated By" },
    { key: "targetedProvidersCount", label: "Targeted" },
    { key: "usdPerRvu", label: "$/RVU" },
    { key: "totalCYRVUs", label: "RVUs" },
    { key: "totalAmountPayable", label: "Amount Payable" },
    { key: "totalAmountPaid", label: "Amount Paid" },
    { key: "status", label: "Status" },
    { key: "action", label: "" }, // Action menu column
  ];

  const userTimeZone = getUserTimeZone();
  const userTimeZoneAbbreviation = getTimeZoneAbbreviation(userTimeZone);

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
      setTargetedProvidersModalOpen(false);
      setSelectedCodeYellowId(null);
    }
    onModalClose();
  }, [currentCodeYellowId, deactivateCodeYellow, onModalClose]);

  const getStatus = useCallback((cyAlertRecord: CYAlertRecord) => {
    const now = dayjs();
    const startTime = dayjs(cyAlertRecord.startTime);
    const endTime = cyAlertRecord.endTime ? dayjs(cyAlertRecord.endTime) : null;
    if (endTime?.isBefore(now)) {
      return "Passed";
    } else if (startTime.isAfter(now)) {
      return "Scheduled";
    } else {
      return "Active";
    }
  }, []);

  const handleEdit = useCallback(
    (cyAlertRecord: CYAlertRecord) => {
      const workList: WorkList = {
        id: cyAlertRecord.worklistId,
        type: WorkListType.GROUP,
        groupId: groupId,
        usdPerRvu: cyAlertRecord.usdPerRvu,
        codeYellows: [],
      };

      const codeYellowData: CodeYellow = {
        id: cyAlertRecord.id,
        worklistId: cyAlertRecord.worklistId,
        worklist: workList,
        usdPerRvu: cyAlertRecord.usdPerRvu,
        isActive: getStatus(cyAlertRecord) === "Active",
        startTime: new Date(cyAlertRecord.startTime),
        endTime: cyAlertRecord.endTime ? new Date(cyAlertRecord.endTime) : null,
        distributionType: cyAlertRecord.distributionType as DistributionType,
        respondingProviders: [],
        group: undefined,
        activatingProvider: undefined,
        limits: {
          amountLimit: cyAlertRecord.totalAmountPayable || undefined,
          RVUsLimit: cyAlertRecord.totalCYRVUs || undefined,
        },
        targetedProvidersCount: cyAlertRecord.targetedProvidersCount,
        targetedProviders: [],
        rvusTotal: cyAlertRecord.totalCYRVUs || 0,
        amountTotal: cyAlertRecord.totalAmountPayable || 0,
        totalAmountPaid: cyAlertRecord.totalAmountPaid || 0,
        canManage: true,
      };

      setSelectedCodeYellow(codeYellowData);
      setIsEditModalOpen(true);
    },
    [groupId, getStatus],
  );

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedCodeYellow(null);
  }, []);

  const handleOpenTargetedProvidersModal = useCallback(
    (codeYellowId: string, status: string) => {
      setSelectedCodeYellowId(codeYellowId);
      setShowSwitch(status === "Active" || status === "Scheduled");
      setTargetedProvidersModalOpen(true);
    },
    [],
  );

  const customRowRenderers = useCallback(
    (cyAlertRecord: CYAlertRecord) => {
      const status = getStatus(cyAlertRecord);
      const isExpanded = selectedCodeYellowForStudies === cyAlertRecord.id;

      let color = "blue.500";
      if (status === "Active") {
        color = "yellow.500";
      } else if (status === "Scheduled") {
        color = "orange.500";
      }

      return (
        <>
          <Td
            cursor="pointer"
            onClick={() =>
              setSelectedCodeYellowForStudies(isExpanded ? null : cyAlertRecord.id)
            }
            width="40px"
          >
            {isExpanded ? (
              <ChevronDownIcon boxSize={5} color="gray.400" />
            ) : (
              <ChevronRightIcon boxSize={5} color="gray.400" />
            )}
          </Td>
          <Td
            textStyle="smMdSemi"
            cursor="pointer"
            onClick={() =>
              setSelectedCodeYellowForStudies(isExpanded ? null : cyAlertRecord.id)
            }
          >
            {`${dayjs(cyAlertRecord.startTime).format(
              "MM/DD/YYYY HH:mm",
            )} (${userTimeZoneAbbreviation})`}
          </Td>
          <Td
            textStyle="smMdSemi"
            cursor="pointer"
            onClick={() =>
              setSelectedCodeYellowForStudies(isExpanded ? null : cyAlertRecord.id)
            }
          >
            {cyAlertRecord.endTime
              ? `${dayjs(cyAlertRecord.endTime).format(
                  "MM/DD/YYYY HH:mm",
                )} (${userTimeZoneAbbreviation})`
              : "N/A"}
          </Td>
          <Td
            textStyle="smMdSemi"
            cursor="pointer"
            onClick={() =>
              setSelectedCodeYellowForStudies(isExpanded ? null : cyAlertRecord.id)
            }
          >
            {cyAlertRecord.activatedBy}
          </Td>
          <Td textStyle="smMdSemi">
            <Text
              cursor="pointer"
              color="yellow.500"
              fontWeight="bold"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenTargetedProvidersModal(cyAlertRecord.id, status);
              }}
            >
              {cyAlertRecord.targetedProvidersCount || cyAlertRecord.groupProvidersCount}
            </Text>
          </Td>
          <Td
            textStyle="smMdSemi"
            cursor="pointer"
            onClick={() =>
              setSelectedCodeYellowForStudies(isExpanded ? null : cyAlertRecord.id)
            }
          >
            {cyAlertRecord.usdPerRvu?.toFixed(2) ?? "N/A"}
          </Td>
          <Td
            textStyle="smMdSemi"
            cursor="pointer"
            onClick={() =>
              setSelectedCodeYellowForStudies(isExpanded ? null : cyAlertRecord.id)
            }
          >
            {cyAlertRecord.totalCYRVUs?.toFixed(2) ?? "0"}
          </Td>
          <Td
            textStyle="smMdSemi"
            cursor="pointer"
            onClick={() =>
              setSelectedCodeYellowForStudies(isExpanded ? null : cyAlertRecord.id)
            }
          >
            ${cyAlertRecord.totalAmountPayable?.toFixed(2) ?? "0.00"}
          </Td>
          <Td
            textStyle="smMdSemi"
            cursor="pointer"
            onClick={() =>
              setSelectedCodeYellowForStudies(isExpanded ? null : cyAlertRecord.id)
            }
          >
            ${cyAlertRecord.totalAmountPaid?.toFixed(2) ?? "0.00"}
          </Td>
          <Td
            cursor="pointer"
            onClick={() =>
              setSelectedCodeYellowForStudies(isExpanded ? null : cyAlertRecord.id)
            }
          >
            <Text textStyle="smMdSemi" color={color}>
              {status}
            </Text>
          </Td>
          <Td>
            {status !== "Passed" && cyAlertRecord.canManage && (
              <Popover placement="bottom" closeOnBlur={true}>
                <PopoverTrigger>
                  <Button variant="ghost" size="sm">
                    <BsThreeDotsVertical />
                  </Button>
                </PopoverTrigger>
                <PopoverContent width="fit-content" bg="#373D59" border={"none"}>
                  {status === "Scheduled" && (
                    <Button
                      bg="#373D59"
                      color="white"
                      fontSize="md"
                      fontWeight="bold"
                      py={4}
                      px={6}
                      _hover={{
                        bg: "#2A2E45",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(cyAlertRecord);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    bg="#373D59"
                    color="white"
                    fontSize="md"
                    fontWeight="bold"
                    py={4}
                    px={6}
                    _hover={{
                      bg: "#2A2E45",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(
                        status === "Scheduled" ? "cancel" : "deactivate",
                        cyAlertRecord.id,
                      );
                    }}
                  >
                    {status === "Scheduled" ? "Cancel" : "Deactivate"}
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </Td>
        </>
      );
    },
    [
      getStatus,
      handleOpenModal,
      handleEdit,
      userTimeZoneAbbreviation,
      handleOpenTargetedProvidersModal,
      selectedCodeYellowForStudies,
    ],
  );

  return (
    <Box>
      <HStack my="4" spacing={4}>
        <DateRangePicker initialDates={datesFilter} onDatesChange={setDatesFilter} />
      </HStack>
      <StickyTableContainer variant="spaced">
        <Table
          variant="unstyled"
          size="sm"
          sx={{
            borderCollapse: "separate !important",
            borderSpacing: "0 0 !important",
          }}
        >
          <Thead>
            <Tr color="gray.500">
              {tableColumns.map((column) => (
                <Th padding={4} key={column.key}>
                  {column.label}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody mt="20px">
            {isLoading ? (
              <Tr>
                <Td colSpan={tableColumns.length} textAlign="center" py={8}>
                  <Text>Loading...</Text>
                </Td>
              </Tr>
            ) : (
              data?.docs.map((cyAlertRecord, index) => (
                <React.Fragment key={cyAlertRecord.id}>
                  {index > 0 && (
                    <Tr style={{ height: "4px" }}>
                      <Td colSpan={tableColumns.length} p={0} border="none" />
                    </Tr>
                  )}
                  <Tr
                    backgroundColor="darkBlue2.900"
                    height="50px"
                    _hover={{ backgroundColor: "darkBlue2.800" }}
                    sx={{
                      marginTop: index === 0 ? "20px" : "0",
                      "& > td:first-of-type": {
                        borderTopLeftRadius: "8px",
                        borderBottomLeftRadius:
                          selectedCodeYellowForStudies === cyAlertRecord.id ? "0" : "8px",
                      },
                      "& > td:last-of-type": {
                        borderTopRightRadius: "8px",
                        borderBottomRightRadius:
                          selectedCodeYellowForStudies === cyAlertRecord.id ? "0" : "8px",
                      },
                      marginBottom:
                        selectedCodeYellowForStudies === cyAlertRecord.id ? "0" : "8px",
                    }}
                  >
                    {customRowRenderers(cyAlertRecord)}
                  </Tr>
                  {selectedCodeYellowForStudies === cyAlertRecord.id && (
                    <Tr
                      backgroundColor="darkBlue2.900"
                      sx={{
                        "& > td:first-of-type": {
                          borderTopLeftRadius: "0",
                          borderBottomLeftRadius:
                            selectedCodeYellowForStudies === cyAlertRecord.id ? "8px" : "0",
                        },
                        "& > td:last-of-type": {
                          borderTopRightRadius: "0",
                          borderBottomRightRadius:
                            selectedCodeYellowForStudies === cyAlertRecord.id ? "8px" : "0",
                        },
                        marginBottom:
                          selectedCodeYellowForStudies === cyAlertRecord.id ? "8px" : "0",
                      }}
                    >
                      <Td
                        colSpan={tableColumns.length}
                        p={0}
                        pt={0}
                        borderTop="none"
                        borderBottomLeftRadius="8px"
                        borderBottomRightRadius="8px"
                      >
                        <Box px={4} pb={4} pt={0}>
                          <ProviderPayableStudiesTable
                            codeYellowId={selectedCodeYellowForStudies}
                          />
                        </Box>
                      </Td>
                    </Tr>
                  )}
                </React.Fragment>
              ))
            )}
          </Tbody>
        </Table>
      </StickyTableContainer>

      <Pagination pages={data?.totalPages ?? 0} currentPage={page} setPage={setPage} />
      {paginationInfo && (
        <Text textStyle="sm" color="#A3AEBF" mt={2} textAlign="center">
          {paginationInfo}
        </Text>
      )}

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
          onClose={handleCloseEditModal}
          codeYellow={selectedCodeYellow as unknown as CodeYellowResponse}
        />
      )}

      <TargetedProvidersModal
        codeYellowId={selectedCodeYellowId}
        isOpen={targetedProvidersModalOpen}
        onClose={() => {
          setTargetedProvidersModalOpen(false);
          setSelectedCodeYellowId(null);
        }}
        showSwitch={showSwitch}
      />
    </Box>
  );
};

export default CYAlertsTable;
