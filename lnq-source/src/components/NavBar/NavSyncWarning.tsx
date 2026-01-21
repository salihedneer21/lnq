import { As, Box, Text } from "@chakra-ui/react";
import { FC } from "react";
import { useGetGroupsNeedingSync } from "../../api/GroupApi";

const NavSyncWarning: FC = () => {
  // Filter groups that need syncing (less than or equal to 2 days remaining)
  const { data, isLoading } = useGetGroupsNeedingSync();

  if (isLoading || !data || data?.amountOfGroupsNeedingSync === 0) return null;

  const amountOfGroupsNeedingSync = data?.amountOfGroupsNeedingSync ?? 0;
  return (
    <Box
      as={"marquee" as unknown as As}
      width="300px"
      height="30px"
      bg="red.500"
      borderRadius="md"
      display="flex"
      alignItems="center"
      direction="right"
      scrollamount="3"
      mr={4}
    >
      <Text color="white" fontWeight="bold" px={2}>
        ⚠️ ATTENTION! {amountOfGroupsNeedingSync} group
        {amountOfGroupsNeedingSync > 1 ? "s" : ""} need
        {amountOfGroupsNeedingSync === 1 ? "s" : ""} sync update!
      </Text>
    </Box>
  );
};

export default NavSyncWarning;
