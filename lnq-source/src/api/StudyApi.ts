import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminCompletedStudy, CompensationSource } from "~types/AdminCompletedStudy";
import { DailyRVUStat } from "~types/DailyRVUStat";
import { PaginatedResponse } from "~types/PaginatedResponse";
import { PaymentStatus } from "~types/PaymentStatus";
import { Study } from "~types/Study";
import { StudyStats } from "~types/StudyStats";

import useApi from "./hooks/useApi";
import { getUserTimeZone } from "../utils/timeZones";

// Set stale times for different types of queries
const DAILY_RVU_STALE_TIME = 1 * 60 * 1000; // 1 minute for RVU tracker
const DEFAULT_STALE_TIME = 1 * 60 * 1000; // 1 minute for other queries

export const useGetMyAdminCompletedStudies = (params: {
  page: number;
  perPage: number;
  groupId: string;
  paymentStatus?: PaymentStatus | null;
  paymentStatusReason?: string | null;
  payableToReader?: "true" | "false" | null;
  associatedToUser?: "true" | "false";
  dateRange?: Date[];
  radiologistIds?: string;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  compensationSource?: CompensationSource | null;
  enabled?: boolean;
}) => {
  const {
    page,
    perPage,
    groupId,
    paymentStatus,
    paymentStatusReason,
    payableToReader,
    associatedToUser,
    dateRange,
    radiologistIds,
    sortBy,
    sortDirection,
    compensationSource,
    enabled,
  } = params;
  const { requestFn } = useApi<PaginatedResponse<AdminCompletedStudy>>({
    url: "/adminStudies",
    method: "GET",
  });

  return useQuery({
    enabled: enabled ?? true,
    queryKey: [
      "adminStudies",
      {
        page,
        perPage,
        groupId,
        paymentStatus,
        paymentStatusReason,
        payableToReader,
        associatedToUser,
        dateRange: dateRange,
        radiologistIds: radiologistIds,
        sortBy,
        sortDirection,
        compensationSource,
      },
    ],
    queryFn: ({ queryKey: [_, data] }) =>
      requestFn(data as unknown as Record<string, unknown>),
  });
};

export const useGetMyStudies = (
  page: number,
  perPage: number,
  completedStudies: boolean,
) => {
  const { requestFn } = useApi<PaginatedResponse<Study>>({
    url: "/myStudies",
    method: "GET",
  });

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    queryKey: ["myStudies", { page, perPage, completedStudies }],
    queryFn: ({ queryKey: [_, data] }) =>
      requestFn(data as unknown as Record<string, unknown>),
  });
};

export const useGetMyStudyStats = () => {
  const { requestFn } = useApi<StudyStats>({
    url: "/myStudyStats",
    method: "GET",
  });

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    queryKey: ["myStudyStats"],
    queryFn: () => requestFn(),
  });
};

export const useGetDailyRVUTracker = (date: Date, groupId?: string) => {
  const { requestFn } = useApi<{
    docs: DailyRVUStat[];
    groupTotalCYRVUs: number;
    groupTotalRVUs: number;
  }>({
    url: "/dailyRVUTracker",
    method: "GET",
  });
  return useQuery({
    enabled: Boolean(groupId),
    staleTime: DAILY_RVU_STALE_TIME, // Daily RVU tracker specific stale time
    refetchInterval: 5000, // Auto-refresh every 5 seconds
    queryKey: ["dailyRVUTracker", { date: date, groupId }],
    queryFn: () => requestFn({ date: date, groupId } as unknown as Record<string, unknown>),
  });
};

export const useUpdateStudyPaymentStatusBulk = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    updatedCount: number;
    remainingCount?: number;
    totalProcessed: number;
  }>({
    url: "/admin/studies/payment-status/bulk",
    method: "PUT",
  });

  return useMutation({
    mutationFn: (data: {
      groupId: string;
      startDate: string;
      endDate: string;
      paymentStatus: PaymentStatus;
    }) => requestFn(data as unknown as Record<string, unknown>),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: ["adminStudies"],
        predicate: (query) => {
          const queryData = query.queryKey[1] as { groupId: string };
          return queryData?.groupId === groupId;
        },
      });
    },
  });
};

export const useUpdateStudyPaymentStatus = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    study: AdminCompletedStudy;
  }>({
    url: "/admin/studies/payment-status",
    method: "PUT",
  });

  return useMutation({
    mutationFn: (data: {
      studyId: string;
      paymentStatus: PaymentStatus;
      groupId: string;
    }) => requestFn(data as unknown as Record<string, unknown>),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({
        queryKey: ["adminStudies"],
        predicate: (query) => {
          const queryData = query.queryKey[1] as { groupId: string };
          return queryData?.groupId === groupId;
        },
      });
    },
  });
};

export interface ProviderPayableStudy {
  amountPayable: number;
  radiologistId: string;
  radiologistName: string;
  totalPayableRVUs: number;
}

export const useGetCodeYellowCompletedStudies = (
  codeYellowId: string | null,
  page: number,
  perPage: number,
) => {
  const { requestFn } = useApi<PaginatedResponse<ProviderPayableStudy>>({
    url: `/codeYellow/${codeYellowId}/completedStudies`,
    method: "GET",
  });

  return useQuery({
    staleTime: DEFAULT_STALE_TIME,
    queryKey: ["codeYellowCompletedStudies", codeYellowId, page, perPage],
    queryFn: () => requestFn({ page, perPage } as unknown as Record<string, unknown>),
    enabled: !!codeYellowId,
  });
};

export const useGetTATReport = (
  page: number,
  perPage: number,
  groupId: string,
  dateRange?: Date[],
  radiologistIds?: string,
) => {
  const { requestFn } = useApi<PaginatedResponse<any>>({
    url: "/tatReport",
    method: "GET",
  });

  const userTimezone = getUserTimeZone();

  return useQuery({
    queryKey: [
      "tatReport",
      {
        page,
        perPage,
        groupId,
        dateRange,
        radiologistIds,
        timezone: userTimezone,
      },
    ],
    queryFn: ({ queryKey: [_, data] }) =>
      requestFn(data as unknown as Record<string, unknown>),
    enabled: !!groupId,
  });
};
