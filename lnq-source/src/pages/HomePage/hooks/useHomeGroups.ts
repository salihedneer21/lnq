import { useMemo } from "react";

import { useGetMyGroups } from "~/api/GroupApi";

export const useHomeGroups = () => {
  const {
    data: myGroupsData,
    isLoading,
    isFetching,
    isFetched,
    error,
  } = useGetMyGroups(1, 0);

  const hasGroups = useMemo(() => (myGroupsData?.docs?.length ?? 0) > 0, [myGroupsData]);

  return {
    myGroupsData,
    isLoadingGroups: isLoading,
    isFetchingGroups: isFetching,
    isFetchedGroups: isFetched,
    hasGroups,
    error,
  };
};

export default useHomeGroups;
