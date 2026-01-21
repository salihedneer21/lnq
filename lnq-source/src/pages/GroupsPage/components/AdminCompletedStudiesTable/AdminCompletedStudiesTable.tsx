import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Progress,
  Select,
  Text,
  Th,
  useToast,
} from "@chakra-ui/react";

import {
  useGetMyAdminCompletedStudies,
  useUpdateStudyPaymentStatus,
  useUpdateStudyPaymentStatusBulk,
} from "~api/StudyApi";
import { THEME_COLORS } from "~base/theme/foundations/colors";
import DateRangePicker from "~components/DateRangePicker/DateRangePicker";
import GroupProviderSelect from "~components/MultiSelect/GroupProviderSelect";
import { IncrementalPagination } from "~components/Pagination/IncrementalPagination";
import { PaymentStatusConfirmationModal } from "~components/PaymentStatusConfirmationModal";
import { ReportType, ReportTypeSelectionModal } from "~components/ReportTypeSelectionModal";
import { SortableHeader } from "~components/SortableHeader";
import { StickyTableContainer, StyledTable } from "~components/StyledTable";
import { useStreamAdminCompletedStudiesCSV } from "~hooks/useStreamAdminCompletedStudiesCSV";
import { useStreamTATReportCSV } from "~hooks/useStreamTATReportCSV";
import {
  AdminCompletedStudy,
  CompensationSource,
  SchedulePayableReason,
} from "~types/AdminCompletedStudy";
import { PaymentStatus } from "~types/PaymentStatus";
import { PaymentStatusReason } from "~/types/PaymentStatusReason";

import AdminCompletedStudyRow from "./AdminCompletedStudyRow";
import { BulkPaymentStatusModal } from "./BulkPaymentStatusModal";
import {
  buildReportParams,
  getPayableToReaderFilterOptions,
  getPaymentStatusFilterOptions,
  handlePaymentStatusError,
  handlePaymentStatusSuccess,
} from "./helpers";
import { tableColumns } from "./tableColumns";

interface Props {
  groupId: string;
  groupName: string;
}

const AdminCompletedStudiesTable: React.FC<Props> = ({ groupId, groupName }) => {
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);
  const [radiologistIds, setRadiologistIds] = useState<string[]>([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | null>(
    null,
  );
  const [paymentStatusReasonFilter, setPaymentStatusReasonFilter] =
    useState<PaymentStatusReason | null>(null);
  const [payableToReaderFilter, setPayableToReaderFilter] = useState<
    "true" | "false" | null
  >(null);
  const [associatedToUserFilter, setAssociatedToUserFilter] = useState<"true" | "false">(
    "true",
  );
  const [datesFilter, setDatesFilter] = useState<Date[]>([]);
  const [compensationSourceFilter, setCompensationSourceFilter] =
    useState<CompensationSource | null>(null);
  const [schedulePayableReasonFilter, setSchedulePayableReasonFilter] =
    useState<SchedulePayableReason | null>(null);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");

  // Payment status management state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: "bulk" | "individual";
    studyId?: string;
  }>({ isOpen: false, type: "bulk" });
  const [bulkPaymentDateRange, setBulkPaymentDateRange] = useState<Date[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showReportTypeModal, setShowReportTypeModal] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    isProcessing: boolean;
    totalProcessed: number;
    remainingCount: number;
    currentBatch: number;
  }>({
    isProcessing: false,
    totalProcessed: 0,
    remainingCount: 0,
    currentBatch: 0,
  });

  const toast = useToast();
  useEffect(() => {
    setPage(1);
  }, [
    radiologistIds,
    paymentStatusFilter,
    paymentStatusReasonFilter,
    payableToReaderFilter,
    associatedToUserFilter,
    datesFilter,
    compensationSourceFilter,
    schedulePayableReasonFilter,
    sortBy,
    sortDirection,
  ]);

  const paymentStatusReason =
    paymentStatusFilter === "PAYABLE" && compensationSourceFilter === "SCHEDULE"
      ? schedulePayableReasonFilter
      : paymentStatusReasonFilter;

  const radiologistIdsParam =
    radiologistIds.length > 0 ? radiologistIds.join(",") : undefined;

  const queryParams = {
    page,
    perPage,
    groupId,
    ...(paymentStatusFilter ? { paymentStatus: paymentStatusFilter } : {}),
    ...(paymentStatusReason ? { paymentStatusReason } : {}),
    ...(payableToReaderFilter ? { payableToReader: payableToReaderFilter } : {}),
    associatedToUser: associatedToUserFilter,
    ...(datesFilter && datesFilter.length > 0 ? { dateRange: datesFilter } : {}),
    ...(radiologistIdsParam ? { radiologistIds: radiologistIdsParam } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(sortDirection ? { sortDirection } : {}),
    ...(compensationSourceFilter ? { compensationSource: compensationSourceFilter } : {}),
  };

  const { data, isLoading } = useGetMyAdminCompletedStudies(queryParams);

  const handleSort = useCallback((sortKey: string, direction: "ASC" | "DESC") => {
    setSortBy(sortKey);
    setSortDirection(direction);
    setPage(1);
  }, []);

  const paginationInfo = data
    ? `Showing ${(page - 1) * perPage + 1}-${Math.min(
        page * perPage,
        data.totalItems,
      )} of ${data.totalItems} results`
    : "";

  const reportParams = buildReportParams({
    groupId,
    groupName,
    dateRange: datesFilter,
    radiologistIds: radiologistIdsParam,
    paymentStatusFilter,
    paymentStatusReason,
    payableToReaderFilter,
    associatedToUserFilter,
    compensationSourceFilter,
  });

  const { streamReport, isStreaming, progress } =
    useStreamAdminCompletedStudiesCSV(reportParams);

  const {
    streamReport: streamTATReport,
    isStreaming: isTATStreaming,
    progress: tatProgress,
  } = useStreamTATReportCSV(reportParams);

  const bulkUpdateMutation = useUpdateStudyPaymentStatusBulk();
  const individualUpdateMutation = useUpdateStudyPaymentStatus();

  // Use helpers for filter options
  const payableToReaderFilterOptions = useMemo(
    () => getPayableToReaderFilterOptions(paymentStatusFilter),
    [paymentStatusFilter],
  );

  const paymentStatusFilterOptions = useMemo(
    () => getPaymentStatusFilterOptions(payableToReaderFilter),
    [payableToReaderFilter],
  );

  const onDatesChange = useCallback((dates: Date[]) => {
    if (dates.length === 2) {
      setDatesFilter(dates);
    } else {
      setDatesFilter([]);
    }
  }, []);

  const handleBulkMarkAsPaid = useCallback(() => {
    setShowBulkModal(true);
  }, []);

  const handleBulkDateRangeSelected = useCallback((dateRange: Date[]) => {
    setBulkPaymentDateRange(dateRange);
    setShowBulkModal(false);
    setConfirmationModal({ isOpen: true, type: "bulk" });
  }, []);

  const handleBackToEditDates = useCallback(() => {
    setConfirmationModal({ isOpen: false, type: "bulk" });
    setShowBulkModal(true);
  }, []);

  const handleIndividualMarkAsPaid = useCallback((studyId: string) => {
    setConfirmationModal({ isOpen: true, type: "individual", studyId });
  }, []);

  const handleBulkConfirmPaymentStatus = useCallback(
    async (dateRange: Date[]) => {
      if (dateRange.length !== 2) return;

      setBatchProgress({
        isProcessing: true,
        totalProcessed: 0,
        remainingCount: 0,
        currentBatch: 1,
      });

      try {
        const [startDate, endDate] = dateRange;
        const result = await bulkUpdateMutation.mutateAsync({
          groupId,
          startDate: dayjs(startDate).format("YYYY-MM-DD"),
          endDate: dayjs(endDate).format("YYYY-MM-DD"),
          paymentStatus: "PAID",
        });

        setBatchProgress((prev) => ({
          ...prev,
          isProcessing: false,
          totalProcessed: result.totalProcessed,
          remainingCount: result.remainingCount ?? 0,
        }));

        if (!result.remainingCount || result.remainingCount <= 0) {
          handlePaymentStatusSuccess(toast, "bulk", result.message);
          setConfirmationModal({ isOpen: false, type: "bulk" });
          setBulkPaymentDateRange([]);
          setBatchProgress({
            isProcessing: false,
            totalProcessed: 0,
            remainingCount: 0,
            currentBatch: 0,
          });
        }
      } catch (error) {
        setBatchProgress((prev) => ({ ...prev, isProcessing: false }));
        handlePaymentStatusError(toast, error);
      }
    },
    [bulkUpdateMutation, groupId, toast],
  );

  const handleContinueProcessing = useCallback(async () => {
    if (bulkPaymentDateRange.length !== 2) return;

    setBatchProgress((prev) => ({
      ...prev,
      isProcessing: true,
      currentBatch: prev.currentBatch + 1,
    }));

    try {
      const [startDate, endDate] = bulkPaymentDateRange;
      const result = await bulkUpdateMutation.mutateAsync({
        groupId,
        startDate: dayjs(startDate).format("YYYY-MM-DD"),
        endDate: dayjs(endDate).format("YYYY-MM-DD"),
        paymentStatus: "PAID",
      });

      setBatchProgress((prev) => ({
        ...prev,
        isProcessing: false,
        totalProcessed: prev.totalProcessed + result.updatedCount,
        remainingCount: result.remainingCount ?? 0,
      }));

      if (!result.remainingCount || result.remainingCount <= 0) {
        handlePaymentStatusSuccess(toast, "bulk", result.message);
        setConfirmationModal({ isOpen: false, type: "bulk" });
        setBulkPaymentDateRange([]);
        setBatchProgress({
          isProcessing: false,
          totalProcessed: 0,
          remainingCount: 0,
          currentBatch: 0,
        });
      }
    } catch (error) {
      setBatchProgress((prev) => ({ ...prev, isProcessing: false }));
      handlePaymentStatusError(toast, error);
    }
  }, [bulkPaymentDateRange, bulkUpdateMutation, groupId, toast]);

  const handleConfirmPaymentStatus = useCallback(async () => {
    try {
      if (confirmationModal.type === "individual" && confirmationModal.studyId) {
        await individualUpdateMutation.mutateAsync({
          studyId: confirmationModal.studyId,
          paymentStatus: "PAID",
          groupId,
        });
        handlePaymentStatusSuccess(toast, "individual");
      }
    } catch (error) {
      handlePaymentStatusError(toast, error);
    } finally {
      setConfirmationModal({ isOpen: false, type: "individual" });
    }
  }, [confirmationModal, groupId, individualUpdateMutation, toast]);

  const handleReportTypeSelected = (reportType: ReportType) => {
    if (reportType === "completedStudies") {
      streamReport();
    } else if (reportType === "tatReport") {
      streamTATReport();
    }
  };

  const studyRow = (study: AdminCompletedStudy) => (
    <AdminCompletedStudyRow
      study={study}
      groupName={groupName}
      onMarkAsPaid={handleIndividualMarkAsPaid}
    />
  );

  const createSortableHeaders = useMemo(
    () => [
      <SortableHeader
        key="orderCode"
        label="Facility Code"
        sortKey="orderCode"
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
      />,
      <SortableHeader
        key="orderDescription"
        label="Order Description"
        sortKey="orderDescription"
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
      />,
      <SortableHeader
        key="cptCodes"
        label="CPT Code"
        sortKey="cptCodes"
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
      />,
      <SortableHeader
        key="readingProvider"
        label="Reading Provider"
        sortKey="readingProvider"
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
      />,
      <SortableHeader
        key="radiologistId"
        label="Provider ID"
        sortKey="radiologistId"
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
      />,
      <SortableHeader
        key="rvu"
        label="RVU"
        sortKey="rvu"
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
      />,
      <Th padding={4} key="activeAlerts">
        Active Alerts
      </Th>,
      <Th padding={4} key="payable">
        Payable
      </Th>,
      <Th padding={4} key="prevailingUsdPerRvu">
        Rate/RVU
      </Th>,
      <Th padding={4} key="prevailingDollarsPayable">
        Prevailing Dollars Payable
      </Th>,
      <SortableHeader
        key="dateFinalized"
        label="Date Finalized"
        sortKey="dateFinalized"
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
      />,
      <Th padding={4} key="paymentStatus">
        Payment Status
      </Th>,
      <Th padding={4} key="paymentStatusReason">
        Status Reason
      </Th>,
      <Th padding={4} key="compensationSource">
        Compensation Source
      </Th>,
      <Th padding={4} key="originalFacility">
        Facility
      </Th>,
      <Th padding={4} key="paidOverTarget">
        Payable Over Target
      </Th>,
      <Th padding={4} key="id">
        Actions
      </Th>,
    ],
    [sortBy, sortDirection, handleSort],
  );

  return (
    <Box>
      <Grid templateColumns="repeat(3, 1fr)" my="4" gap={4}>
        <FormControl variant="floating" maxW="full" alignSelf="center">
          <Select
            minH="56px"
            textColor="white"
            placeholder="Select Payable to Reader"
            value={payableToReaderFilter ?? ""}
            onChange={(e) => setPayableToReaderFilter(e.target.value as "true" | "false")}
            sx={{
              option: {
                backgroundColor: "gray.700",
                color: "white",
              },
            }}
          >
            {payableToReaderFilterOptions.map((v) => (
              <option key={v} value={v}>
                {v === "true" ? "Yes" : "No"}
              </option>
            ))}
          </Select>
          <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue[900] }}>
            Payable to Reader
          </FormLabel>
        </FormControl>
        <FormControl variant="floating" maxW="full">
          <Select
            textColor="white"
            placeholder="Select Payment Status"
            minH="56px"
            value={paymentStatusFilter ?? ""}
            sx={{
              option: {
                backgroundColor: "gray.700",
                color: "white",
              },
            }}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value as PaymentStatus);
              if ((e.target.value as PaymentStatus) !== "NONPAYABLE") {
                setPaymentStatusReasonFilter(null);
              }
              if ((e.target.value as PaymentStatus) !== "PAYABLE") {
                setCompensationSourceFilter(null);
                setSchedulePayableReasonFilter(null);
              }
            }}
          >
            {paymentStatusFilterOptions.map((v) => (
              <option value={v} key={v}>
                {v}
              </option>
            ))}
          </Select>
          <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue[900] }}>
            Payment Status
          </FormLabel>
        </FormControl>
        {paymentStatusFilter === "NONPAYABLE" && (
          <FormControl variant="floating" maxW="full">
            <Select
              textColor="white"
              placeholder="Select Non-Payable Reason"
              minH="56px"
              sx={{
                option: {
                  backgroundColor: "gray.700",
                  color: "white",
                },
              }}
              value={paymentStatusReasonFilter ?? ""}
              onChange={(e) =>
                setPaymentStatusReasonFilter(e.target.value as PaymentStatusReason)
              }
            >
              {[
                "NOT_OPEN_DURING_LNQ",
                "CPT_CODE_NOT_FOUND",
                "READING_PROVIDER_NOT_TARGETED",
                "TARGETING_DISABLED",
                "EXCLUDED_PROCEDURE",
                "IR_MG_STUDY",
              ].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </Select>
            <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue[900] }}>
              Non-Payable Reason
            </FormLabel>
          </FormControl>
        )}
        {paymentStatusFilter === "PAYABLE" && (
          <FormControl variant="floating" maxW="full">
            <Select
              textColor="white"
              placeholder="Select Compensation Source"
              minH="56px"
              value={compensationSourceFilter ?? ""}
              sx={{
                option: {
                  backgroundColor: "gray.700",
                  color: "white",
                },
              }}
              onChange={(e) => {
                const value = e.target.value as CompensationSource;
                setCompensationSourceFilter(value);
                if (value !== "SCHEDULE") {
                  setPaymentStatusReasonFilter(null);
                } else if (value === "SCHEDULE" && !paymentStatusReasonFilter) {
                  setPaymentStatusReasonFilter("ON_SCHEDULE_PAYABLE_ON_SHIFT");
                }
              }}
            >
              <option value="LNQ">LNQ</option>
              <option value="SCHEDULE">SCHEDULE</option>
            </Select>
            <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue[900] }}>
              Compensation Source
            </FormLabel>
          </FormControl>
        )}
        {paymentStatusFilter === "PAYABLE" && compensationSourceFilter === "SCHEDULE" && (
          <FormControl variant="floating" maxW="full">
            <Select
              textColor="white"
              placeholder="Select Schedule Payable Reason"
              minH="56px"
              sx={{
                option: {
                  backgroundColor: "gray.700",
                  color: "white",
                },
              }}
              value={schedulePayableReasonFilter ?? ""}
              onChange={(e) =>
                setSchedulePayableReasonFilter(e.target.value as SchedulePayableReason)
              }
            >
              <option value="ON_SCHEDULE_PAYABLE_ON_SHIFT">
                On Schedule Payable On Shift
              </option>
              <option value="ON_SCHEDULE_PAYABLE_OVER_TARGET">
                On Schedule Payable Over Target
              </option>
            </Select>
            <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue[900] }}>
              Schedule Payable Reason
            </FormLabel>
          </FormControl>
        )}
        <DateRangePicker onDatesChange={onDatesChange} />
        <GridItem colSpan={2}>
          <GroupProviderSelect
            groupId={groupId}
            onChange={(newValue) => {
              if (Array.isArray(newValue)) {
                setRadiologistIds(
                  newValue.map(
                    (option) => (option as { label: string; value: string }).value,
                  ),
                );
              } else if (newValue) {
                setRadiologistIds([(newValue as { label: string; value: string }).value]);
              } else {
                setRadiologistIds([]);
              }
            }}
          />
        </GridItem>
        <FormControl variant="floating" maxW="full" alignSelf="center">
          <Select
            minH="56px"
            textColor="white"
            placeholder="Select if associated with user"
            sx={{
              option: {
                backgroundColor: "gray.700",
                color: "white",
              },
            }}
            value={associatedToUserFilter ?? "true"}
            onChange={(e) => setAssociatedToUserFilter(e.target.value as "true" | "false")}
          >
            {[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ].map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue[900] }}>
            Associated with User
          </FormLabel>
        </FormControl>
      </Grid>
      <Box display="flex" gap={4}>
        <Box>
          <Button
            variant="outline"
            colorScheme="brandYellow"
            w="full"
            isDisabled={isStreaming || isTATStreaming}
            onClick={() => {
              setShowReportTypeModal(true);
            }}
            mb={isStreaming || isTATStreaming ? "0" : "4"}
          >
            {isStreaming || isTATStreaming ? "Generating..." : "Export Report"}
          </Button>
          {(isStreaming || isTATStreaming) && (
            <Progress
              value={isStreaming ? progress : tatProgress}
              mt="2"
              size="sm"
              colorScheme="brandYellow"
              borderRadius="md"
              w="full"
            />
          )}
        </Box>
        <Box>
          <Button
            variant="outline"
            colorScheme="brandYellow"
            w="full"
            onClick={handleBulkMarkAsPaid}
            mb="2"
            isDisabled={batchProgress.isProcessing}
          >
            {batchProgress.isProcessing ? "Processing..." : "Mark Studies As Paid"}
          </Button>
          {batchProgress.totalProcessed > 0 && (
            <Text textStyle="sm" color="gray.300" mt="2">
              Total processed: {batchProgress.totalProcessed} studies
              {batchProgress.remainingCount > 0 &&
                ` (${batchProgress.remainingCount} remaining)`}
            </Text>
          )}
        </Box>
      </Box>
      <StickyTableContainer variant="spaced">
        <StyledTable
          columns={tableColumns}
          data={data?.docs ?? []}
          customRowRenderers={studyRow}
          headerColumns={createSortableHeaders}
          loading={isLoading}
          rowHeight={40}
        />
      </StickyTableContainer>
      <IncrementalPagination
        currentPage={page}
        setPage={setPage}
        hasMore={isLoading ? false : (data?.docs.length ?? 0) === (data?.perPage ?? 0)}
      />
      {/* Modals */}
      <BulkPaymentStatusModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onConfirm={handleBulkDateRangeSelected}
        isLoading={batchProgress.isProcessing}
      />
      {confirmationModal.type === "bulk" ? (
        <PaymentStatusConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => {
            setConfirmationModal({ isOpen: false, type: "bulk" });
            setBulkPaymentDateRange([]);
            setBatchProgress({
              isProcessing: false,
              totalProcessed: 0,
              remainingCount: 0,
              currentBatch: 0,
            });
          }}
          onConfirm={() => {
            if (bulkPaymentDateRange.length === 2) {
              handleBulkConfirmPaymentStatus(bulkPaymentDateRange);
            }
          }}
          onBack={handleBackToEditDates}
          onContinueProcessing={() => {
            handleContinueProcessing();
          }}
          type="bulk"
          selectedDate={
            bulkPaymentDateRange.length === 2
              ? `${dayjs(bulkPaymentDateRange[0]).format("MM/DD/YYYY")} - ${dayjs(
                  bulkPaymentDateRange[1],
                ).format("MM/DD/YYYY")}`
              : undefined
          }
          isLoading={bulkUpdateMutation.isPending || batchProgress.isProcessing}
          showContinueProcessing={batchProgress.remainingCount > 0}
          remainingCount={batchProgress.remainingCount}
          totalProcessed={batchProgress.totalProcessed}
        />
      ) : (
        <PaymentStatusConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal({ isOpen: false, type: "individual" })}
          onConfirm={() => {
            handleConfirmPaymentStatus();
          }}
          type="individual"
          isLoading={individualUpdateMutation.isPending}
        />
      )}
      <ReportTypeSelectionModal
        isOpen={showReportTypeModal}
        onClose={() => setShowReportTypeModal(false)}
        onReportTypeSelected={handleReportTypeSelected}
      />
      {paginationInfo && (
        <Text textStyle="smMd" color="#A3AEBF" mt={2} textAlign="center">
          {paginationInfo}
        </Text>
      )}
    </Box>
  );
};

export default AdminCompletedStudiesTable;
