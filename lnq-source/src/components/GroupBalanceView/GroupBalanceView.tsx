import { Box, SimpleGrid, Td, Text } from "@chakra-ui/react";
import { useState, useCallback, useMemo, memo, useRef } from "react";
import { useGroupBalanceStats } from "../../hooks/useGroupBalanceStats";
import StudyStatsCard from "../StudyStatsCard/StudyStatsCard";
import { StyledTable, StickyTableContainer } from "../StyledTable";
import { SortableHeader } from "../SortableHeader";
import { GroupBalanceStats } from "../../types/GroupBalanceStats";

interface Props {
  groupId: string;
}

const StatsCards = memo(
  ({ groupStats }: { groupStats: GroupBalanceStats["groupStats"] }) => {
    if (!groupStats) return null;

    return (
      <SimpleGrid columns={{ base: 1, lg: 6 }} spacing="24px" mb="72px">
        <StudyStatsCard
          backgroundColor="#FF9760"
          title="Total Lifetime Completed Studies"
          subtitle={groupStats.totalLifetimeStudies?.toString() ?? "N/A"}
          subtitleStyle="h4"
        />
        <StudyStatsCard
          backgroundColor="#32E484"
          title="Total Lifetime RVUs Completed"
          subtitle={
            groupStats.totalLifetimeRVUs
              ? Number(groupStats.totalLifetimeRVUs).toFixed(2)
              : "N/A"
          }
          subtitleStyle="h4"
        />
        <StudyStatsCard
          backgroundColor="#91B6FE"
          title="Studies Pending Payment"
          subtitle={groupStats.pendingPaymentStudies?.toString() ?? "N/A"}
          subtitleStyle="h4"
        />
        <StudyStatsCard
          backgroundColor="#F7E376"
          title="RVU's Pending Payment"
          subtitle={
            groupStats.pendingPaymentRVUs
              ? Number(groupStats.pendingPaymentRVUs).toFixed(2)
              : "N/A"
          }
          subtitleStyle="h4"
        />
        <StudyStatsCard
          backgroundColor="#FEC0A8"
          title="Total Unmapped CPT Studies"
          subtitle={groupStats.unmappedStudies?.toString() ?? "N/A"}
          subtitleStyle="h4"
        />
        <StudyStatsCard
          backgroundColor="brandYellow.600"
          title="Pending Payment Amount"
          subtitle={
            groupStats.pendingPaymentAmount
              ? `$${Number(groupStats.pendingPaymentAmount).toFixed(2)}`
              : "N/A"
          }
          subtitleStyle="h4"
        />
      </SimpleGrid>
    );
  },
);

StatsCards.displayName = "StatsCards";

const BalanceTable = memo(
  ({
    providerStats,
    sortBy,
    sortDirection,
    onSort,
    isTableLoading,
  }: {
    providerStats: GroupBalanceStats["providerStats"];
    sortBy: string | undefined;
    sortDirection: "ASC" | "DESC";
    onSort: (sortKey: string, direction: "ASC" | "DESC") => void;
    isTableLoading: boolean;
  }) => {
    const providerRow = useCallback(
      (row: GroupBalanceStats["providerStats"][number]) => (
        <>
          <Td>{`${row.lastName || ""} ${row.firstName || ""}`}</Td>
          <Td isNumeric>{row.totalStudies ?? "N/A"}</Td>
          <Td isNumeric>{row.totalRVUs ? Number(row.totalRVUs).toFixed(2) : "N/A"}</Td>
          <Td isNumeric>{row.pendingStudies ?? "N/A"}</Td>
          <Td isNumeric>{row.pendingRVUs ? Number(row.pendingRVUs).toFixed(2) : "N/A"}</Td>
          <Td isNumeric>
            {row.pendingAmount ? `$${Number(row.pendingAmount).toFixed(2)}` : "N/A"}
          </Td>
          <Td isNumeric>
            {row.paidAmount ? `$${Number(row.paidAmount).toFixed(2)}` : "N/A"}
          </Td>
        </>
      ),
      [],
    );

    const headers = useMemo(
      () => [
        { label: "Provider", sortKey: "provider" },
        { label: "Total Studies", sortKey: "totalstudies" },
        { label: "Total RVUs", sortKey: "totalrvus" },
        { label: "Pending Studies", sortKey: "pendingstudies" },
        { label: "Pending RVUs", sortKey: "pendingrvus" },
        { label: "Pending Amount", sortKey: "pendingamount" },
        { label: "Paid Amount", sortKey: "paidamount" },
      ],
      [],
    );

    const sortableHeaders = useMemo(
      () => (
        <>
          {headers.map(({ label, sortKey }) => (
            <SortableHeader
              key={sortKey}
              label={label}
              sortKey={sortKey}
              currentSortBy={sortBy}
              currentSortDirection={sortDirection}
              onSort={onSort}
            />
          ))}
        </>
      ),
      [headers, sortBy, sortDirection, onSort],
    );

    const tableColumns = useMemo(
      () => headers.map(({ sortKey: key, label }) => ({ key, label })),
      [headers],
    );

    return (
      <StickyTableContainer variant="spaced">
        <StyledTable
          columns={tableColumns}
          data={isTableLoading ? [] : providerStats}
          customRowRenderers={providerRow}
          headerColumns={sortableHeaders}
          size="sm"
        />
        {isTableLoading && (
          <Box textAlign="center" py={8}>
            <Text>Loading table data...</Text>
          </Box>
        )}
        {!isTableLoading && !providerStats.length && (
          <Box textAlign="center" py={8}>
            <Text>No data available</Text>
          </Box>
        )}
      </StickyTableContainer>
    );
  },
);

BalanceTable.displayName = "BalanceTable";

export const GroupBalanceView = ({ groupId }: Props) => {
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");
  const lastSuccessfulData = useRef<GroupBalanceStats | null>(null);

  const { data, isLoading, error } = useGroupBalanceStats({
    groupId,
    sortBy,
    sortDirection,
  });

  if (data && !isLoading) {
    lastSuccessfulData.current = data;
  }

  const displayData = lastSuccessfulData.current ?? data;
  const isInitialLoading = isLoading && !lastSuccessfulData.current;
  const isTableLoading = isLoading && Boolean(lastSuccessfulData.current);

  const handleSort = useCallback((sortKey: string, direction: "ASC" | "DESC") => {
    setSortBy(sortKey);
    setSortDirection(direction);
  }, []);

  if (isInitialLoading) {
    return <Text>Loading...</Text>;
  }

  if (error && !displayData) {
    console.error("Error fetching group balance stats:", error);
    return <Text>Error loading data. Please try again later.</Text>;
  }

  if (!displayData?.groupStats || !displayData.providerStats) {
    return <Text>No data available</Text>;
  }

  return (
    <Box mt={16}>
      <StatsCards groupStats={displayData.groupStats} />
      <BalanceTable
        providerStats={data?.providerStats ?? []}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        isTableLoading={isTableLoading}
      />
    </Box>
  );
};
