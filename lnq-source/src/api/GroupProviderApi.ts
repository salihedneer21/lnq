import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import useApi from "./hooks/useApi";
import { ProviderProfile } from "../types/CurrentUser";
import { GroupProvider } from "../types/Group";

interface InviteUserResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    providerId: string;
    accountStatus: string;
  };
  password: string;
  passwordStatus: string;
  groupSettings: {
    status: string;
    rvuTrackerOptIn: boolean;
  };
}

interface ResetPasswordResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  password: string;
  passwordStatus: string;
}

export const useInviteUserToGroup = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<InviteUserResponse>({
    url: "/group/inviteUserToGroup",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: {
      groupId: string;
      email: string;
      firstName: string;
      lastName: string;
      npi: string;
    }) => {
      return requestFn(data);
    },
    onSuccess: (response, variables) => {
      // Invalidate queries
      Promise.all([
        // Invalidate providers list
        queryClient.invalidateQueries({
          queryKey: ["/group/providers", { id: variables.groupId }],
        }),

        queryClient.invalidateQueries({
          queryKey: ["providers", variables.groupId],
          exact: false,
        }),

        // Invalidate other related queries
        queryClient.invalidateQueries({ queryKey: ["group", { id: variables.groupId }] }),
        queryClient.invalidateQueries({ queryKey: ["myGroups"] }),

        queryClient.refetchQueries({
          queryKey: ["/group/providers"],
          exact: false,
        }),
      ]);

      return response;
    },
    onError: (error) => {
      console.error("Error in invitation:", error);
    },
  });
};

export const useResetProviderPassword = () => {
  const { requestFn } = useApi<ResetPasswordResponse>({
    url: "/group/resetProviderPassword",
    method: "POST",
  });
  return useMutation({
    mutationFn: async (data: { groupId: string; groupMemberId: string }) => {
      return await requestFn(data);
    },
    onError: (error) => {
      console.error("Error resetting password:", error);
    },
  });
};

export const useGetProviderProfile = (providerId: string | undefined) => {
  const { requestFn } = useApi<ProviderProfile>({
    method: "GET",
    url: `/group/providers/${providerId}`,
  });

  return useQuery({
    queryKey: ["provider", providerId],
    queryFn: requestFn,
    enabled: !!providerId && providerId.trim() !== "",
  });
};

export const useUpdateProvider = (providerId: string | undefined) => {
  const { requestFn } = useApi<ProviderProfile>({
    url: `/group/providers/${providerId}`,
    method: "PUT",
  });

  return useMutation({
    mutationFn: async (data: Partial<ProviderProfile>) => {
      if (!providerId || providerId.trim() === "") {
        throw new Error("Provider ID is required");
      }
      const response = await requestFn({
        data,
      });
      return response;
    },
  });
};

export const useCheckProviderProfileAccess = (providerId: string | undefined) => {
  const { requestFn } = useApi<{
    hasAccess: boolean;
    isAdmin: boolean;
    isOwnProfile: boolean;
    groupId: string;
    groupName: string;
    providerUserId: string;
  }>({
    method: "GET",
    url: `/group/providers/${providerId}/access`,
  });

  return useQuery({
    queryKey: ["providerAccess", providerId],
    queryFn: requestFn,
    enabled: !!providerId && providerId.trim() !== "",
  });
};

export const useSearchProviders = (groupId: string, search: string) => {
  const trimmedSearch = search.trim();

  const { requestFn } = useApi<{
    providers: GroupProvider[];
    totalCount: number;
    searchTerm: string;
  }>({
    url: `group/${groupId}/providers/search?search=${encodeURIComponent(trimmedSearch)}`,
    method: "GET",
  });

  return useQuery({
    queryKey: ["providers", groupId, trimmedSearch],
    queryFn: () => requestFn(),
    enabled: trimmedSearch.length >= 1,
  });
};
