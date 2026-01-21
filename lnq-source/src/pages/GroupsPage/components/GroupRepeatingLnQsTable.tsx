import React, { useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import { useGetMyRepeatingCodeYellows } from "../../../api/CodeYellowApi";
import { RepeatingLnQTable } from "../../../components/CodeYellowTable/RepeatingLnQTable";
import { Pagination } from "../../../components/Pagination/Pagination";

interface GroupRepeatingLnQsTableProps {
  groupId: string;
}

export const GroupRepeatingLnQsTable: React.FC<GroupRepeatingLnQsTableProps> = ({
  groupId,
}) => {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { data, isLoading } = useGetMyRepeatingCodeYellows(page, perPage, groupId);

  const paginationInfo = data
    ? `Showing ${(page - 1) * perPage + 1}-${Math.min(
        page * perPage,
        data.totalItems || 0,
      )} of ${data.totalItems || 0} results`
    : "";

  return (
    <Box p={4} mt={6}>
      <RepeatingLnQTable data={data?.docs ?? []} loading={isLoading} />
      <Pagination pages={data?.totalPages ?? 0} currentPage={page} setPage={setPage} />
      {paginationInfo && (
        <Text textStyle="sm" color="#A3AEBF" mt={2} textAlign="center">
          {paginationInfo}
        </Text>
      )}
    </Box>
  );
};
