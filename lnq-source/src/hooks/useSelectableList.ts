import { useMemo, useState } from "react";
import xor from "lodash/xor";

export const useSelectableList = ({ ids }: { ids: string[] }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [allToggled, setAllToggled] = useState(false);

  const isIndeterminate = useMemo(() => {
    const diff = xor(selectedIds, ids);
    if (diff.length === ids.length) {
      // it is empty
      return false;
    }

    return diff.length > 0; // not fully selected
  }, [ids, selectedIds]);

  const handleToggleAll = () => {
    if (!allToggled) {
      setAllToggled(true);
      setSelectedIds(ids);
      return;
    }
    setAllToggled(false);
    setSelectedIds([]);
  };

  const setInitialSelectedIds = (initialSelectedIds: string[]) => {
    const allAlreadySelected =
      initialSelectedIds === undefined ? false : xor(initialSelectedIds, ids).length === 0;
    if (allAlreadySelected) {
      setAllToggled(true);
    }
    setSelectedIds(initialSelectedIds);
  };
  const handleSelectItem = (userId: string) => {
    if (allToggled) {
      setAllToggled(false);
    }
    const selectedProviders = xor([userId], selectedIds);
    setSelectedIds(selectedProviders);
    if (ids.length === selectedProviders.length) {
      setAllToggled(true);
    }
  };

  const getIsItemSelected = (userId: string) => {
    return allToggled || selectedIds.some((id) => userId === id);
  };

  const reset = () => {
    setAllToggled(false);
    setSelectedIds([]);
  };

  return {
    allToggled,
    setInitialSelectedIds,
    onToggleCheckAll: handleToggleAll,
    onSelectItem: handleSelectItem,
    getIsItemSelected,
    reset,
    isIndeterminate,
    dirty: selectedIds.length,
    selectedIds,
  };
};
