import { useCheckUserLnqRights } from "../../api/GroupApi";

export const useLnqRights = () => {
  const { data: lnqRights, isLoading, refetch } = useCheckUserLnqRights();

  return {
    hasLnqRights: lnqRights?.hasLnqRights ?? false,
    isLoading,
    refetch,
  };
};
