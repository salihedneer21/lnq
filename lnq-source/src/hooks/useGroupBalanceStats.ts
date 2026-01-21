// hooks/useGroupBalanceStats.ts
import { useQuery } from "@tanstack/react-query";

import { GroupBalanceStats } from "../types/GroupBalanceStats";
import useApi from "../api/hooks/useApi.ts";

interface UseGroupBalanceStatsParams {
  groupId?: string;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}

export const useGroupBalanceStats = ({
  groupId,
  sortBy,
  sortDirection,
}: UseGroupBalanceStatsParams) => {
  const { requestFn } = useApi<GroupBalanceStats>({
    url: "/groupBalance",
    method: "GET",
  });

  return useQuery({
    queryKey: ["groupBalance", groupId, sortBy, sortDirection],
    queryFn: () =>
      requestFn({
        groupId,
        sortBy,
        sortDirection,
      }),
    enabled: !!groupId,
  });
};
