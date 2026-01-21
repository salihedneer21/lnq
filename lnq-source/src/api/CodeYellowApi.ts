import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CodeYellow, DistributionType, Limits, LnqRepeat } from "../types/CodeYellow";
import { RepetitionSettings } from "../types/Repetition";
import useApi from "./hooks/useApi";
import { PaginatedResponse } from "../types/PaginatedResponse";
import { CYAlertRecord } from "../types/CYAlertRecord";
import { PaginatedCodeYellowResponse } from "../types/CodeYellowResponse";

// Set stale time for LnQ queries
const LNQ_STALE_TIME = 1 * 60 * 1000; // 1 minute for LnQ related queries

// Activate Regular CodeYellow (LnQ)
export const useActivateCodeYellow = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<
    {
      message: string;
      codeYellow: CodeYellow;
    },
    {
      worklistId: string;
      distributionType?: "open" | "target";
      usdPerRvu?: number;
      dateRange?: { start: string; end?: string };
      userIds?: string[];
      groupId?: string;
      limits?: Limits;
    }
  >({
    url: "/codeYellow",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: {
      worklistId: string;
      distributionType?: "open" | "target";
      usdPerRvu?: number;
      dateRange?: { start: string; end?: string };
      userIds?: string[];
      groupId?: string;
      limits?: Limits;
    }) => {
      return requestFn(data);
    },
    onSuccess: (_, { worklistId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["myGroups", { role: "admin" }] }),
        queryClient.invalidateQueries({ queryKey: ["worklist", worklistId] }),
        queryClient.invalidateQueries({ queryKey: ["activeAdminCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myActiveCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myScheduledCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myActiveTargetedCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myScheduledTargetedCodeYellows"] }),
        queryClient.invalidateQueries({
          queryKey: ["codeYellowTargetedProvidersWithAvailability"],
        }),
      ]).then(() => {
        if (onSuccess) onSuccess();
      });
    },
  });
};

// Activate Repeating CodeYellow (LnQ)
export const useActivateRepeatingCodeYellow = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    codeYellow: CodeYellow;
  }>({
    url: "/repeatingLnQ",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: {
      worklistId: string;
      distributionType?: "open" | "target";
      usdPerRvu?: number;
      dateRange?: { start: string; end?: string };
      userIds?: string[];
      groupId?: string;
      limits?: Limits;
      repeat: RepetitionSettings;
      name?: string;
    }) => {
      return requestFn(data);
    },
    onSuccess: (_, { worklistId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["myGroups", { role: "admin" }] }),
        queryClient.invalidateQueries({ queryKey: ["worklist", worklistId] }),
        queryClient.invalidateQueries({ queryKey: ["activeAdminCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myActiveCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myScheduledCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myActiveTargetedCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myScheduledTargetedCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myRepeatingCodeYellows"] }),
        queryClient.invalidateQueries({
          queryKey: ["codeYellowTargetedProvidersWithAvailability"],
        }),
      ]).then(() => {
        if (onSuccess) onSuccess();
      });
    },
  });
};

// Deactivate CodeYellow
export const useDeactivateCodeYellow = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    codeYellow: CodeYellow;
  }>({
    url: "/codeYellow/deactivate",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: { codeYellowId: string }) => requestFn(data),
    onSuccess: async (_, { codeYellowId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["myGroups", { role: "admin" }] }),
        queryClient.invalidateQueries({ queryKey: ["codeYellow", codeYellowId] }),
        queryClient.invalidateQueries({ queryKey: ["activeAdminCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myActiveCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myScheduledCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myActiveTargetedCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myScheduledTargetedCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["adminGroupCodeYellowRecords"] }),
        queryClient.invalidateQueries({ queryKey: ["myRepeatingCodeYellows"] }),
      ]);
    },
  });
};

export const useDeactivateLnqRepeat = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    lnqRepeat: any;
    deletedCodeYellows?: number;
  }>({
    url: "/repeatingLnQ/:lnqRepeatId",
    method: "DELETE",
  });

  return useMutation({
    mutationFn: (data: { lnqRepeatId: string }) =>
      requestFn({ params: { lnqRepeatId: data.lnqRepeatId } }),
    onSuccess: async (response, variables) => {
      console.log("LnQ repeat deactivated successfully:", response);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["myGroups", { role: "admin" }] }),
        queryClient.invalidateQueries({ queryKey: ["myRepeatingCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["lnqRepeat", variables.lnqRepeatId] }),
      ]);
    },
    onError: (error) => {
      console.error("Error deactivating LnQ repeat:", error);
    },
  });
};
// Get My CodeYellows
export const useGetMyActiveCodeYellows = (page: number, perPage: number) => {
  const { requestFn } = useApi<PaginatedCodeYellowResponse>({
    url: "/codeYellow/myActiveCodeYellows",
    method: "GET",
  });

  return useQuery({
    staleTime: LNQ_STALE_TIME,
    queryKey: ["myActiveCodeYellows", page, perPage],
    queryFn: () => requestFn({ page, perPage }),
  });
};

export const useGetMyScheduledCodeYellows = (page: number, perPage: number) => {
  const { requestFn } = useApi<PaginatedCodeYellowResponse>({
    url: "/codeYellow/myScheduledCodeYellows",
    method: "GET",
  });

  return useQuery({
    staleTime: LNQ_STALE_TIME,
    queryKey: ["myScheduledCodeYellows", page, perPage],
    queryFn: () => requestFn({ page, perPage }),
  });
};

export const useGetMyRepeatingCodeYellows = (
  page: number,
  perPage: number,
  groupId?: string,
) => {
  const { requestFn } = useApi<PaginatedResponse<LnqRepeat>>({
    url: "/repeatingLnQ/my",
    method: "GET",
  });

  return useQuery({
    staleTime: LNQ_STALE_TIME,
    queryKey: ["myRepeatingCodeYellows", { page, perPage, groupId }],
    queryFn: () => requestFn({ page, perPage, groupId }),
  });
};

export const useGetAdminGroupCodeYellowRecords = (
  page: number,
  perPage: number,
  groupId: string,
  dateRange: Date[],
) => {
  const { requestFn } = useApi<PaginatedResponse<CYAlertRecord>>({
    url: "/codeYellow/adminGroupCodeYellowRecords",
    method: "GET",
  });

  return useQuery({
    queryKey: ["adminGroupCodeYellowRecords", { page, perPage, groupId, dateRange }],
    staleTime: LNQ_STALE_TIME,
    queryFn: () =>
      requestFn({
        page: Number(page),
        perPage: Number(perPage),
        groupId,
        dateRange: dateRange.map((date) => date.toISOString()),
      }),
  });
};

export const useGetCodeYellowTargetedProviders = (
  codeYellowId?: string,
  page?: number,
  perPage?: number,
) => {
  const { requestFn } = useApi<{
    message: string;
    targetedProviders: { id: string; name: string }[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
    hasNextPage: boolean;
    distributionType: "OPEN" | "TARGET";
  }>({
    url: `/codeYellow/${codeYellowId}/targetedProviders`,
    method: "GET",
  });

  return useQuery({
    queryKey: ["codeYellowTargetedProviders", codeYellowId, page, perPage],
    queryFn: () => {
      const params: Record<string, any> = {};
      if (page !== undefined) params.page = page;
      if (perPage !== undefined) params.perPage = perPage;

      return requestFn(Object.keys(params).length > 0 ? params : undefined);
    },
    enabled: typeof codeYellowId === "string" && codeYellowId !== "",
  });
};

export interface CodeYellowTargetedProvidersWithAvailabilityResponse {
  message: string;
  targetedProviders: {
    id: string;
    name: string;
    availability: boolean;
    canOptIn: boolean;
    canOptOut: boolean;
    responded: boolean;
    respondingProvider?: {
      id: string;
      timeOptIn: string;
      timeOptOut?: string;
      user: { id: string };
    };
  }[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
  hasNextPage: boolean;
  distributionType: "OPEN" | "TARGET";
}

export const useGetCodeYellowTargetedProvidersWithAvailability = (
  codeYellowId: string | null,
  page?: number,
  perPage?: number,
) => {
  const { requestFn } = useApi<CodeYellowTargetedProvidersWithAvailabilityResponse>({
    url: `/codeYellow/${codeYellowId}/targetedProvidersWithAvailability`,
    method: "GET",
  });

  return useQuery({
    queryKey: ["codeYellowTargetedProvidersWithAvailability", codeYellowId, page, perPage],
    queryFn: () => {
      const params: Record<string, any> = {};
      if (page !== undefined) params.page = page;
      if (perPage !== undefined) params.perPage = perPage;

      return requestFn(Object.keys(params).length > 0 ? params : undefined);
    },
    enabled: typeof codeYellowId === "string" && codeYellowId !== "",
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 0,
  });
};

export const useGetGroupTargetedProviders = (groupId: string) => {
  const { requestFn } = useApi<{
    message: string;
    targetedProviders: { id: string; name: string }[];
    totalCount: number;
  }>({
    url: `/group/${groupId}/groupTargetedProviders`,
    method: "GET",
  });

  return useQuery({
    queryKey: ["codeYellowTargetedProviders", groupId],
    queryFn: () => requestFn(),
    enabled: !!groupId,
  });
};

export const useUpdateCodeYellow = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    codeYellow: CodeYellow;
  }>({
    url: "/codeYellow/update",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: {
      codeYellowId: string;
      usdPerRvu: number;
      startTime: string;
      limits: { amountLimit?: number; RVUsLimit?: number };
      endTime: string | null;
      distributionType: DistributionType;
      userIds: string[];
    }) => requestFn(data),
    onSuccess: async (_, { codeYellowId }) => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["myGroups", { role: "admin" }] }),
        queryClient.invalidateQueries({ queryKey: ["codeYellow", codeYellowId] }),
        queryClient.invalidateQueries({ queryKey: ["activeAdminCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myActiveCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myScheduledCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["myRepeatingCodeYellows"] }),
        queryClient.invalidateQueries({ queryKey: ["adminGroupCodeYellowRecords"] }),
      ]);
    },
  });
};

export const useGetMyActiveTargetedCodeYellows = (page: number, perPage: number) => {
  const { requestFn } = useApi<PaginatedCodeYellowResponse>({
    url: "/codeYellow/myActiveTargetedCodeYellows",
    method: "GET",
  });

  return useQuery({
    staleTime: LNQ_STALE_TIME,
    queryKey: ["myActiveTargetedCodeYellows", page, perPage],
    queryFn: () => requestFn({ page, perPage }),
  });
};

export const useGetMyScheduledTargetedCodeYellows = (page: number, perPage: number) => {
  const { requestFn } = useApi<PaginatedCodeYellowResponse>({
    url: "/codeYellow/myScheduledTargetedCodeYellows",
    method: "GET",
  });

  return useQuery({
    staleTime: LNQ_STALE_TIME,
    queryKey: ["myScheduledTargetedCodeYellows", page, perPage],
    queryFn: () => requestFn({ page, perPage }),
  });
};

export const useGetUserHasPersonalActiveLnQ = () => {
  const { requestFn } = useApi<{
    hasPersonalActiveLnQ: boolean;
  }>({
    url: "/codeYellow/getUserHasPersonalActiveLnQ",
    method: "GET",
  });

  return useQuery({
    queryKey: ["hasPersonalCodeYellow"],
    queryFn: () => requestFn(),
  });
};

export const useGetAvailableLnqsToRespondTo = (page: number, perPage: number) => {
  const { requestFn } = useApi<PaginatedCodeYellowResponse>({
    url: "/codeYellow/getAvailableLnqsToRespondTo",
    method: "GET",
  });

  return useQuery({
    queryKey: ["availableLnqsToRespondTo", page, perPage],
    queryFn: () => requestFn({ page, perPage }),
  });
};
