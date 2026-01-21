import { Select } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useGetGroupsWithRvuTrackerRights } from "~/api/GroupApi";

interface Props {
  onGroupSelected: (groupId: string, timezone: string | undefined) => void;
}

const GroupSelector: React.FC<Props> = ({ onGroupSelected }) => {
  const { data, isLoading } = useGetGroupsWithRvuTrackerRights(1, 0);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>();

  const groupsWithRvuTrackerRights = data?.docs ?? [];
  useEffect(() => {
    if (groupsWithRvuTrackerRights && groupsWithRvuTrackerRights.length >= 1) {
      setSelectedGroup(groupsWithRvuTrackerRights[0].group.id);
      onGroupSelected(
        groupsWithRvuTrackerRights[0].group.id,
        groupsWithRvuTrackerRights[0].group.timeZone,
      );
    }
  }, [groupsWithRvuTrackerRights, onGroupSelected]);

  const onSetGroup = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedGroupId = event.target.value;
      const selectedGroupTimezone = groupsWithRvuTrackerRights.find(
        (g) => g.group.id === selectedGroupId,
      )?.group.timeZone;
      setSelectedGroup(selectedGroupId);
      onGroupSelected(selectedGroupId, selectedGroupTimezone);
    },
    [groupsWithRvuTrackerRights, onGroupSelected],
  );

  return (
    <Select
      maxW="fit-content"
      placeholder="Select Group"
      textColor="white"
      color="white"
      value={selectedGroup}
      isDisabled={
        isLoading || (groupsWithRvuTrackerRights && groupsWithRvuTrackerRights.length <= 1)
      }
      onChange={onSetGroup}
      sx={{
        option: {
          backgroundColor: "darkBlue2.900",
          color: "white",
        },
      }}
    >
      {(groupsWithRvuTrackerRights ?? []).map((g) => (
        <option key={g.group.id} value={g.group.id}>
          {g.group.facilityName}
        </option>
      ))}
    </Select>
  );
};

export default GroupSelector;
