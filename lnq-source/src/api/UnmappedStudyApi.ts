import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  UnmappedStudy,
  MappingCheckRequest,
  MappingCheckResult,
  MappingRequest,
  BulkMappingRequest,
} from "../types/UnmappedStudy";
import useApi from "./hooks/useApi";

const DEFAULT_STALE_TIME = 1 * 60 * 1000; // 1 minute

interface UnmappedStudiesResponse {
  message: string;
  data: UnmappedStudy[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export const useGetUnmappedStudies = (
  page: number,
  limit: number,
  groupId: string,
  enabled?: boolean,
  search?: string,
  sortBy?: string,
  sortDirection?: "ASC" | "DESC",
) => {
  const { requestFn } = useApi<
    UnmappedStudiesResponse,
    {
      page: number;
      limit: number;
      search?: string;
      sortBy?: string;
      sortDirection?: "ASC" | "DESC";
    }
  >({
    url: `/groups/${groupId}/unmapped-studies`,
    method: "GET",
  });

  return useQuery({
    enabled: enabled ?? true,
    queryKey: ["unmappedStudies", { page, limit, search, sortBy, sortDirection }],
    queryFn: ({ queryKey: [_, data] }) => {
      const { page, limit, search, sortBy, sortDirection } = data as {
        page: number;
        limit: number;
        search?: string;
        sortBy?: string;
        sortDirection?: "ASC" | "DESC";
      };
      const requestData: {
        page: number;
        limit: number;
        search?: string;
        sortBy?: string;
        sortDirection?: "ASC" | "DESC";
      } = { page, limit };

      if (search && search.trim().length > 0) {
        requestData.search = search.trim();
      }

      if (sortBy) {
        requestData.sortBy = sortBy;
        requestData.sortDirection = sortDirection ?? "DESC";
      }

      return requestFn(requestData);
    },
    staleTime: enabled ? 0 : DEFAULT_STALE_TIME,
    refetchOnMount: Boolean(enabled),
  });
};

export const useCheckCPTMapping = (groupId: string) => {
  const { requestFn } = useApi<MappingCheckResult, MappingCheckRequest>({
    url: `/groups/${groupId}/unmapped-studies/validate-cpt-codes`,
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: MappingCheckRequest) => requestFn(data),
  });
};

export const useCreateMappingRequest = (groupId: string) => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{ message: string; data: any }, MappingRequest>({
    url: `/groups/${groupId}/unmapped-studies/mapping-request`,
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: MappingRequest) => requestFn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["unmappedStudies"],
      });
    },
  });
};

export const useBulkMapStudies = (groupId: string) => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{ message: string; data: any }, BulkMappingRequest>({
    url: `/groups/${groupId}/unmapped-studies/apply-mapping`,
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: BulkMappingRequest) => requestFn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["unmappedStudies"],
      });
      queryClient.invalidateQueries({
        queryKey: ["adminStudies"],
      });
    },
  });
};

export const useGetAffectedStudies = (
  groupId: string,
  facilityName?: string,
  procedureCode?: string,
  enabled?: boolean,
) => {
  const { requestFn } = useApi<
    { message: string; data: UnmappedStudy[] },
    { facilityName: string; procedureCode: string }
  >({
    url: `/groups/${groupId}/unmapped-studies/affected-studies`,
    method: "GET",
  });

  return useQuery({
    enabled: (enabled ?? true) && !!facilityName && !!procedureCode,
    queryKey: ["affectedStudies", { groupId, facilityName, procedureCode }],
    queryFn: ({ queryKey }) => {
      const data = queryKey[1] as {
        groupId: string;
        facilityName: string;
        procedureCode: string;
      };
      return requestFn({
        facilityName: data.facilityName,
        procedureCode: data.procedureCode,
      });
    },
    staleTime: DEFAULT_STALE_TIME,
  });
};
