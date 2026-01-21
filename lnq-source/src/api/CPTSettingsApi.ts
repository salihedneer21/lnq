import { useMutation, useQuery } from "@tanstack/react-query";
import useApi from "./hooks/useApi";
import { AxiosInstance } from "./_AxiosInstance";
import {
  CPTSearchResult,
  GroupCPTOverride,
  UpdateCPTOverrideRequest,
} from "../types/CPTSettings";

export const useSearchCPTCodes = (groupId: string, search: string) => {
  const { requestFn } = useApi<CPTSearchResult[]>({
    url: `group/${groupId}/cpt/search`,
    method: "GET",
  });

  return useQuery({
    queryKey: ["cptSearch", groupId, search],
    queryFn: () => requestFn({ search }),
    enabled: search.length >= 3,
  });
};

export const useGetGroupCPTOverrides = (groupId: string) => {
  const { requestFn } = useApi<GroupCPTOverride[]>({
    url: `group/${groupId}/cpt-overrides`,
    method: "GET",
  });

  return useQuery({
    queryKey: ["groupCPTOverrides", groupId],
    queryFn: () => requestFn({}),
  });
};

export const useUpdateCPTOverride = () => {
  const { requestFn } = useApi<{ message: string; override: GroupCPTOverride }>({
    url: "group/cpt-override",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: UpdateCPTOverrideRequest) => requestFn(data),
  });
};

export const useResetToMasterCPT = () => {
  return useMutation({
    mutationFn: ({ groupId, cptCode }: { groupId: string; cptCode: string }) =>
      AxiosInstance.request<{ message: string }>({
        url: `group/${groupId}/cpt-override/${cptCode}`,
        method: "DELETE",
      }).then((res) => res.data),
  });
};
