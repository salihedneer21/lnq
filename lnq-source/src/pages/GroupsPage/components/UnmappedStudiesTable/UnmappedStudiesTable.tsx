import { useState, useCallback, useMemo } from "react";
import { Button, Td, Text, Box, Badge, HStack, Th } from "@chakra-ui/react";

import { StyledTable } from "~/components/StyledTable/StyledTable";
import { StickyTableContainer } from "~/components/StyledTable/StickyTableContainer";
import { Pagination } from "~/components/Pagination/Pagination";
import { SortableHeader } from "~/components/SortableHeader/SortableHeader";
import { UnmappedStudy } from "~/types/UnmappedStudy";
import { useGetUnmappedStudies } from "~/api/UnmappedStudyApi";
import { formatShortDate } from "~/utils/dateFormatters";
import { SearchInput } from "../SearchInput";
import MapStudyModal from "../MapStudyModal/MapStudyModal";

interface UnmappedStudiesTableProps {
  groupId: string;
  isActive: boolean;
}

export const UnmappedStudiesTable = ({ groupId, isActive }: UnmappedStudiesTableProps) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedStudy, setSelectedStudy] = useState<UnmappedStudy | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  const {
    data: unmappedStudiesData,
    isLoading,
    refetch,
  } = useGetUnmappedStudies(
    page,
    limit,
    groupId,
    isActive,
    searchQuery.trim() || undefined,
    sortBy,
    sortDirection,
  );

  const tableColumns = [
    { key: "facilityCode", label: "Facility Code" },
    { key: "orderDescription", label: "Order Description" },
    { key: "facility", label: "Facility" },
    { key: "dateFinalized", label: "Date Finalized" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Action" },
  ];

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    const colorScheme =
      {
        "NEEDS MAPPING": "red",
        "PENDING MAPPING REQUEST": "blue",
      }[statusUpper] ?? "gray";

    return (
      <Badge colorScheme={colorScheme} variant="solid" fontSize="xs" px={2} py={1}>
        {statusUpper}
      </Badge>
    );
  };

  const handleMapStudy = (study: UnmappedStudy) => {
    setSelectedStudy(study);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedStudy(null);
  };

  const handleModalSuccess = () => {
    refetch();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleSort = useCallback((sortKey: string, direction: "ASC" | "DESC") => {
    setSortBy(sortKey);
    setSortDirection(direction);
    setPage(1);
  }, []);

  const createSortableHeaders = useMemo(
    () => (
      <>
        <SortableHeader
          label="Facility Code"
          sortKey="facilityCode"
          currentSortBy={sortBy}
          currentSortDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableHeader
          label="Order Description"
          sortKey="orderDescription"
          currentSortBy={sortBy}
          currentSortDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableHeader
          label="Facility"
          sortKey="facility"
          currentSortBy={sortBy}
          currentSortDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableHeader
          label="Date Finalized"
          sortKey="dateFinalized"
          currentSortBy={sortBy}
          currentSortDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableHeader
          label="Status"
          sortKey="status"
          currentSortBy={sortBy}
          currentSortDirection={sortDirection}
          onSort={handleSort}
        />
        <Th padding={4}>Action</Th>
      </>
    ),
    [sortBy, sortDirection, handleSort],
  );

  const colGroups = (
    <colgroup>
      <col style={{ width: "16.67%" }} />
      <col style={{ width: "16.67%" }} />
      <col style={{ width: "16.67%" }} />
      <col style={{ width: "16.67%" }} />
      <col style={{ width: "16.67%" }} />
      <col style={{ width: "16.67%" }} />
    </colgroup>
  );

  const studyRow = (row: UnmappedStudy) => {
    const isPendingRequest = row.status === "Pending Mapping Request";

    return (
      <>
        <Td>
          <Text textStyle="smMdSemi" color="white">
            {row.facilityCode}
          </Text>
        </Td>
        <Td>
          <Text
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
            textStyle="smMdSemi"
            title={row.orderDescription}
            maxWidth="300px"
          >
            {row.orderDescription}
          </Text>
        </Td>
        <Td>
          <Text textStyle="smMdSemi">{row.facility}</Text>
        </Td>
        <Td>
          <Text textStyle="smMdSemi">{formatShortDate(row.dateFinalized)}</Text>
        </Td>
        <Td>{getStatusBadge(row.status)}</Td>
        <Td>
          {!isPendingRequest && (
            <Button
              variant="solid"
              size="sm"
              colorScheme="brandYellow"
              textColor="brandBlue.800"
              fontWeight="700"
              onClick={() => handleMapStudy(row)}
              _hover={{ bg: "brandYellow.300" }}
            >
              Map Study
            </Button>
          )}
        </Td>
      </>
    );
  };

  return (
    <Box>
      <HStack pt={4} mb={4}>
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          placeholder="Search by facility code, order description, or facility..."
          inputHeight="56px"
        />
      </HStack>
      {unmappedStudiesData?.data?.length === 0 && !isLoading && (
        <Text fontSize={18} fontWeight="700" color="white" mt={6} textAlign="center">
          {searchQuery.trim()
            ? "No unmapped studies found matching your search"
            : "No unmapped studies found"}
        </Text>
      )}
      <StickyTableContainer variant="spaced">
        <StyledTable
          columns={tableColumns}
          customRowRenderers={studyRow}
          data={unmappedStudiesData?.data ?? []}
          loading={isLoading}
          colGroups={colGroups}
          headerColumns={createSortableHeaders}
          size="sm"
        />
      </StickyTableContainer>
      <Pagination
        pages={unmappedStudiesData?.pagination?.totalPages ?? 0}
        currentPage={page}
        setPage={setPage}
      />
      {selectedStudy && (
        <MapStudyModal
          study={selectedStudy}
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          groupId={groupId}
        />
      )}
    </Box>
  );
};

export default UnmappedStudiesTable;
