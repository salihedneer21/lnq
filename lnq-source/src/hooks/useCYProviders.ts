import { useCallback, useEffect, useState } from "react";
import { useGetProvidersInGroupUsingIntegration } from "../api/GroupApi";
import { ProvidersScheduleMode } from "../types/Group";
import { useSelectableList } from "./useSelectableList";
import { get24TimeFromDate } from "../utils/dateFormatters";
import { useGetCodeYellowTargetedProviders } from "../api/CodeYellowApi";
import { WorkListType } from "../types/Worklist";

export const useCYProviders = ({
  groupId,
  dateRange,
  codeYellowId,
  editing,
  targetedProvidersCount,
  lnqType,
}: {
  groupId?: string;
  dateRange?: { start?: string; end?: string };
  codeYellowId?: string;
  editing?: boolean;
  targetedProvidersCount?: number;
  lnqType?: WorkListType;
}) => {
  const [targetProviders, setTargetProviders] = useState(false);
  const [mode, setMode] = useState<ProvidersScheduleMode>("all");

  // Note about lnqType: This hook doesn't filter providers based on LnQ type
  // The filtering should be done at a higher level by controlling the groupId that's passed in
  // For Personal LnQ: any group the user is a member of
  // For Group LnQ: only groups where the user is an admin

  const { data: groupWithProviders, isLoading: isGettingProvidersInGroup } =
    useGetProvidersInGroupUsingIntegration(groupId, 1, 0, {
      mode,
      startDate: dateRange?.start,
      endDate: dateRange?.end,
      startTime: dateRange?.start ? get24TimeFromDate(dateRange.start) : undefined,
      endTime: dateRange?.end ? get24TimeFromDate(dateRange?.end) : undefined,
    });
  const providerIds = (groupWithProviders?.providers ?? []).map(({ user: { id } }) => id);

  const { data, isLoading, isFetched } = useGetCodeYellowTargetedProviders(
    editing && (targetedProvidersCount ?? 0) >= 0 ? codeYellowId : undefined,
  );

  const selectableListSettings = useSelectableList({
    ids: providerIds,
  });

  useEffect(() => {
    // set the initial selected ids
    const shouldSetInitialSelectedIds =
      !selectableListSettings.dirty &&
      Array.isArray(data?.targetedProviders) &&
      data?.targetedProviders?.length > 0;
    if (shouldSetInitialSelectedIds) {
      selectableListSettings.setInitialSelectedIds(
        data?.targetedProviders?.map(({ id }) => id) ?? [],
      );
      setTargetProviders(true);
    }
  }, [data, isFetched, isLoading, selectableListSettings]);

  const handleSetMode = useCallback(
    (newMode: ProvidersScheduleMode) => () => {
      setMode(newMode);
      selectableListSettings.reset();
    },
    [selectableListSettings],
  );

  const handleToggleTargetProviders = () => setTargetProviders(!targetProviders);

  const handleReset = () => {
    selectableListSettings.reset();
    setTargetProviders(false);
  };

  return {
    onModeChange: handleSetMode,
    onToggleTargetProviders: handleToggleTargetProviders,
    targetProviders,
    providers: groupWithProviders?.providers ?? [],
    mode,
    isLoading: isGettingProvidersInGroup,
    groupId,
    ...selectableListSettings,
    reset: handleReset,
    dateRange,
    lnqType,
  };
};
