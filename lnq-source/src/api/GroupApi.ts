import { PaymentMethod } from "@stripe/stripe-js";
import {
  Group,
  GroupProvider,
  GroupProviderWithQGendaIntegration,
  ProvidersScheduleMode,
} from "../types/Group";
import { PaginatedResponse } from "../types/PaginatedResponse";
import useApi from "./hooks/useApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GroupMonthlyReport } from "../types/MonthlyReport";
import { MyGroupResponse, AllGroupResponse } from "../types/GroupResponse";

// Set stale time for group queries
const GROUP_STALE_TIME = 1 * 60 * 1000; // 1 minute for group-related queries

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    paymentSession: {
      client_secret: string;
      customer: string;
    };
    group: Group;
  }>({
    url: "/group",
    method: "POST",
  });

  interface Props {
    facilityId?: string;
    facilityName: string;
    phone: string | null;
    description: string;
    timeZone: string;
    email: string;
  }

  return useMutation({
    mutationFn: (data: Props) => requestFn(data),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["allGroups"] }),
        queryClient.invalidateQueries({ queryKey: ["myGroups"] }),
      ]),
  });
};

export const useGetGroup = (groupId?: string) => {
  const { requestFn } = useApi<{
    message: string;
    group: Group;
    paymentOptions: PaymentMethod[];
    isAdmin: boolean;
  }>({
    url: "/group",
    method: "GET",
  });

  return useQuery({
    queryKey: ["group", { id: groupId }],
    queryFn: ({ queryKey: [, data] }) => {
      if (
        !groupId ||
        !/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(groupId)
      ) {
        return Promise.reject(new Error("Group ID must be a UUID"));
      }
      return requestFn(data);
    },
    enabled: typeof groupId === "string" && groupId.trim() !== "",
  });
};

export const useGetMyGroups = (
  page: number,
  perPage: number,
  role?: "admin" | "member",
) => {
  const { requestFn } = useApi<PaginatedResponse<MyGroupResponse>>({
    url: "/myGroups",
    method: "GET",
  });
  return useQuery({
    staleTime: GROUP_STALE_TIME,
    queryKey: ["myGroups", { page, perPage, role }],
    queryFn: ({ queryKey: [, data] }) => requestFn(data),
  });
};

export const useGetAllGroups = (page: number, perPage: number) => {
  const { requestFn } = useApi<PaginatedResponse<AllGroupResponse>>({
    url: "/allGroups",
    method: "GET",
  });

  return useQuery({
    queryKey: ["allGroups", { page, perPage }],
    queryFn: ({ queryKey: [, data] }) => requestFn(data),
  });
};

export const useGetMyGroupsWithLnqRights = (page: number, perPage: number) => {
  const { requestFn } = useApi<PaginatedResponse<MyGroupResponse>>({
    url: "/group/getGroupsWithLnqRights",
    method: "GET",
  });

  return useQuery({
    queryKey: ["groupsWithLnqRights", { page, perPage }],
    queryFn: () => requestFn({ page, perPage }),
  });
};

export const useEditGroup = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    group: Group;
    isAdmin: boolean;
  }>({
    url: "/group",
    method: "PATCH",
  });
  interface Props {
    id: string;
    facilityName: string;
    description: string;
    phone: string | null;
    email: string;
    timeZone: string;
    rvuRateVisible: boolean;
  }

  return useMutation({
    mutationFn: (data: Props) => requestFn(data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["group", { id }] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
  });
};

export const useSetPreferredPaymentMethodId = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    group: Group;
    isAdmin: boolean;
  }>({
    url: "/group/setPreferredPaymentMethodId",
    method: "PATCH",
  });
  return useMutation({
    mutationFn: (data: { id: string; paymentMethodOptionId: string }) => requestFn(data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["group", { id }] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
  });
};

export const useSetGroupPayoutEnabled = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    group: Group;
    isAdmin: boolean;
  }>({
    url: "/group/setGroupPayoutEnabled",
    method: "PATCH",
  });
  return useMutation({
    mutationFn: (data: { id: string; payoutEnabled: boolean }) => requestFn(data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["group", { id }] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
  });
};

export const useSetGroupTargetedPayment = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/targetedPaymentOnly",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: { groupId: string; targetedPaymentOnly: boolean }) =>
      requestFn(data),
    onSuccess: (_, { groupId }) =>
      queryClient.invalidateQueries({ queryKey: ["group", { id: groupId }] }),
  });
};

export const useRequestGroup = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/request",
    method: "POST",
  });

  return useMutation({
    mutationFn: (id: string) => requestFn({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allGroups"] }),
  });
};

export const useGetProvidersInGroup = (
  groupId: string | undefined,
  page: number,
  perPage: number,
  filters: {
    status?: "pending" | "accepted";
    activeOnly?: boolean;
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
    sortKey?: number;
  },
) => {
  const { requestFn } = useApi<{
    message: string;
    providers: GroupProvider[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
  }>({
    url: `/group/providers`,
    method: "GET",
  });

  return useQuery({
    staleTime: GROUP_STALE_TIME,
    queryKey: ["/group/providers", { id: groupId, page, perPage, ...filters }],
    queryFn: ({ queryKey: [, data] }) => requestFn(data),
    enabled: !!groupId && groupId.trim() !== "",
  });
};

export const useGetProvidersInGroupUsingIntegration = (
  groupId: string | undefined,
  page: number,
  perPage: number,
  filters: {
    mode: ProvidersScheduleMode;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
  },
) => {
  const { requestFn } = useApi<{
    message: string;
    providers: GroupProviderWithQGendaIntegration[];
    currentPage: number;
    totalItems: number;
  }>({
    url: `/group/providers`,
    method: "GET",
  });

  return useQuery({
    queryKey: [
      "/group/providers/integration",
      { id: groupId, integration: "qgenda", page, perPage, ...filters },
    ],
    queryFn: ({ queryKey: [, data] }) => requestFn(data),
    staleTime: 500,
    enabled: typeof groupId === "string",
  });
};

export const useLeaveGroup = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/provider/leave",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (id: string) => requestFn({ id }),
    onSuccess: (_, id) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["allGroups"] }),
        queryClient.invalidateQueries({ queryKey: ["myGroups"] }),
        queryClient.invalidateQueries({ queryKey: ["/group/providers", { id }] }),
        queryClient.invalidateQueries({ queryKey: ["group", { id }] }),
      ]),
  });
};

export const useAcceptGroupRequest = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/accept",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: { id: string; groupId: string }) => requestFn(data),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ["/group/providers", { id: groupId }] });

      queryClient.invalidateQueries({
        queryKey: ["providers", groupId],
        exact: false,
      });
    },
  });
};

export const useRemoveGroupPaymentMethodOption = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<
    { group: Group; paymentMethodOptionId: string },
    { id: string; paymentMethodOptionId: string }
  >({
    url: "/group/removePaymentMethodFromGroup",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: { paymentMethodOptionId: string; id: string }) => requestFn(data),
    onSuccess: (_, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["allGroups"] }),
        queryClient.invalidateQueries({ queryKey: ["myGroups"] }),
        queryClient.invalidateQueries({ queryKey: ["group", { id }] }),
      ]),
  });
};

export const useRemoveUserFromGroup = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/remove",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: { id: string; groupId: string }) => requestFn(data),
    onSuccess: (_, { groupId }) => {
      // Invalidate main providers query
      queryClient.invalidateQueries({ queryKey: ["/group/providers", { id: groupId }] });

      // Invalidate search results queries to fix caching issue
      queryClient.invalidateQueries({
        queryKey: ["providers", groupId],
        exact: false,
      });
    },
  });
};

export const useSetGroupProviderRole = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({ url: "/group/setGroupProviderRole", method: "PATCH" });

  return useMutation({
    mutationFn: (data: {
      groupProviderId: string;
      groupId: string;
      role: "admin" | "member";
    }) => requestFn(data),
    onSuccess: (_, { groupId }) => {
      // Invalidate main providers query
      queryClient.invalidateQueries({ queryKey: ["/group/providers", { id: groupId }] });

      queryClient.invalidateQueries({
        queryKey: ["providers", groupId],
        exact: false,
      });
    },
  });
};

export const useSetGroupRVUTackerOptIn = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/setGroupProviderRVUTackerOptIn",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: {
      groupProviderId: string;
      groupId: string;
      rvuTrackerOptIn: boolean;
    }) => requestFn(data),
    onSuccess: (_, { groupId }) => {
      // Invalidate main providers query
      queryClient.invalidateQueries({ queryKey: ["/group/providers", { id: groupId }] });

      // Invalidate search results queries to fix caching issue
      queryClient.invalidateQueries({
        queryKey: ["providers", groupId],
        exact: false,
      });
    },
  });
};

export const useSetGroupProviderPayoutEnabled = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/setGroupProviderPayoutEnabled",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: {
      groupProviderId: string;
      groupId: string;
      payoutEnabled: boolean;
    }) => requestFn(data),
    onSuccess: (_, { groupId }) => {
      // Invalidate main providers query
      queryClient.invalidateQueries({ queryKey: ["/group/providers", { id: groupId }] });

      // Invalidate search results queries to fix caching issue
      queryClient.invalidateQueries({
        queryKey: ["providers", groupId],
        exact: false,
      });
    },
  });
};

export const useSyncGroupSchedule = (groupId?: string) => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{ message: string }>({
    url: `/schedule/${groupId}/sync`,
    method: "POST",
  });

  return useMutation({
    mutationFn: () => requestFn(),
    onSuccess: (_, groupId) => {
      queryClient.invalidateQueries({ queryKey: ["group", { id: groupId }] });
    },
  });
};

export const useSetGroupProviderTargetingEnabled = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/setProviderTargetingEnabled",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: {
      groupProviderId: string;
      groupId: string;
      targetingEnabled: boolean;
    }) => requestFn(data),
    onSuccess: (_, { groupId }) => {
      // Invalidate main providers query
      queryClient.invalidateQueries({ queryKey: ["/group/providers", { id: groupId }] });

      // Invalidate search results queries to fix caching issue
      queryClient.invalidateQueries({
        queryKey: ["providers", groupId],
        exact: false,
      });
    },
  });
};

export const useGetGroupMonthlyReport = (
  groupId: string,
  month: string,
  utcOffset: number,
  page = 1,
  perPage = 10,
) => {
  const { requestFn } = useApi<GroupMonthlyReport>({
    url: `/group/${groupId}/monthly-report`,
    method: "GET",
  });

  return useQuery<GroupMonthlyReport, Error>({
    queryKey: ["groupMonthlyReport", groupId, month, utcOffset, page, perPage],
    queryFn: () => requestFn({ month, utcOffset, page, perPage }),
    enabled: !!groupId && !!month,
  });
};

export const useSetGroupLnQEnabled = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    group: Group;
    isAdmin: boolean;
  }>({
    url: "/group/setGroupLnQEnabled",
    method: "PATCH",
  });
  return useMutation({
    mutationFn: (data: { id: string; isLnQEnabled: boolean }) => requestFn(data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["group", { id }] });
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
  });
};

export const useSetGroupProviderLnqEnabled = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/setGroupProviderLnqEnabled",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: { groupProviderId: string; groupId: string; lnqEnabled: boolean }) =>
      requestFn(data),
    onSuccess: (_, { groupId }) => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["/group/providers"],
          predicate: (query) => {
            const queryData = query.queryKey[1] as { id: string };
            return queryData?.id === groupId;
          },
        }),
        // Invalidate search results queries to fix caching issue
        queryClient.invalidateQueries({
          queryKey: ["providers", groupId],
          exact: false,
        }),
        queryClient.invalidateQueries({ queryKey: ["userLnqRights"] }),
        queryClient.invalidateQueries({ queryKey: ["myGroups"] }),
      ]);
    },
  });
};

export const useCheckUserLnqRights = () => {
  const { requestFn } = useApi<{
    hasLnqRights: boolean;
    groups: {
      groupId: string;
      groupName: string;
    }[];
  }>({
    url: "/group/checkUserLnqRights",
    method: "GET",
  });

  return useQuery({
    queryKey: ["userLnqRights"],
    queryFn: () => requestFn({}),
  });
};

export const useGetGroupsNeedingSync = () => {
  const { requestFn } = useApi<{ amountOfGroupsNeedingSync: number }>({
    url: "/group/getGroupsNeedingSync",
    method: "GET",
  });

  return useQuery({
    queryKey: ["groupsNeedingSync"],
    queryFn: () => requestFn(),
  });
};

export const useSetGroupRVUTrackerVisibility = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{ message: string }>({
    url: `/group/provider/rvu-tracker-visibility`,
    method: "PUT",
  });

  return useMutation({
    mutationFn: (data: {
      groupProviderId: string;
      groupId: string;
      visibility: "view_all" | "view_self" | "none";
    }) => requestFn(data),
    onSuccess: (_, { groupId }) => {
      // Invalidate main providers query
      queryClient.invalidateQueries({ queryKey: ["/group/providers", { id: groupId }] });

      // Invalidate search results queries to fix caching issue
      queryClient.invalidateQueries({
        queryKey: ["providers", groupId],
        exact: false,
      });
    },
  });
};

export const useCheckUserRVUTrackerRights = () => {
  const { requestFn } = useApi<{
    hasRVUTrackerRights: boolean;
    groups: {
      groupId: string;
      groupName: string;
    }[];
  }>({
    url: "/group/checkUserRVUTrackerRights",
    method: "GET",
  });

  return useQuery({
    queryKey: ["userRVUTrackerRights"],
    queryFn: () => requestFn({}),
  });
};

export const useGetGroupsWithRvuTrackerRights = (page: number, perPage: number) => {
  const { requestFn } = useApi<
    PaginatedResponse<{
      group: Group;
      rvuTrackerVisibility: "view_all" | "view_self" | "none";
    }>
  >({
    url: "/group/getGroupsRVUTrackerRights",
    method: "GET",
  });

  return useQuery({
    queryKey: ["groupsWithRvuTrackerRights", { page, perPage }],
    queryFn: () => requestFn({ page, perPage }),
  });
};

export const useSetGroupProviderFixedUsdPerRvu = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi({
    url: "/group/setGroupProviderFixedUsdPerRvu",
    method: "PATCH",
  });

  return useMutation({
    mutationFn: (data: {
      groupProviderId: string;
      groupId: string;
      fixedUsdPerRvuEnabled: boolean;
      fixedUsdPerRvu: number;
    }) => requestFn(data),
    onSuccess: (_, { groupId }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["/group/providers"],
          predicate: (query) => {
            const queryData = query.queryKey[1] as { id: string };
            return queryData?.id === groupId;
          },
        }),
        // Invalidate search results queries to fix caching issue
        queryClient.invalidateQueries({
          queryKey: ["providers", groupId],
          exact: false,
        }),
        queryClient.invalidateQueries({ queryKey: ["myGroups"] }),
      ]),
  });
};
