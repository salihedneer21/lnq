import React, { useState } from "react";
import { Box, Text, Td } from "@chakra-ui/react";

import { ProviderPayableStudy, useGetCodeYellowCompletedStudies } from "~/api/StudyApi";
import { Pagination } from "~/components/Pagination/Pagination";
import { StyledTable } from "~/components/StyledTable/StyledTable";

interface Props {
  codeYellowId: string | null;
}

interface TableColumn {
  key: keyof ProviderPayableStudy;
  label: string;
}

const ProviderPayableStudiesTable: React.FC<Props> = ({ codeYellowId }) => {
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);

  const { data, isLoading } = useGetCodeYellowCompletedStudies(codeYellowId, page, perPage);

  const tableColumns: TableColumn[] = [
    { key: "radiologistName", label: "Reading Provider" },
    { key: "totalPayableRVUs", label: "Total Payable RVUs" },
    { key: "amountPayable", label: "Amount Payable" },
  ];

  const paginationInfo =
    data?.totalPages && data?.totalPages > 0
      ? `Showing ${(page - 1) * perPage + 1}-${Math.min(
          page * perPage,
          data?.totalItems ?? 0,
        )} of ${data?.totalItems ?? 0} results`
      : "";

  const customRowRenderers = (study: ProviderPayableStudy) => {
    return (
      <>
        <Td>
          <Text textStyle={"sm"}>
            {study.radiologistName && study.radiologistName.length > 0
              ? study.radiologistName
              : "-"}
          </Text>
        </Td>
        <Td>
          <Text textStyle={"sm"}>{study.totalPayableRVUs?.toFixed(2) ?? "0.00"}</Text>
        </Td>
        <Td>
          <Text textStyle={"sm"}>${study.amountPayable?.toFixed(2) ?? "0.00"}</Text>
        </Td>
      </>
    );
  };

  if (!codeYellowId) {
    return null;
  }

  return (
    <>
      <Box
        borderTop="1px solid"
        borderColor="gray.400"
        paddingBottom="4"
        sx={{
          "& table": {
            borderCollapse: "collapse !important",
            borderSpacing: "0 !important",
          },
          "& tbody tr": {
            borderBottom: "1px solid white",
          },

          "& tbody tr:last-child": {
            borderBottom: "none",
          },
          // Only these specific cells will have border radius, all others will have none.
          "& td": {
            borderRadius: "0 !important",
          },
          "& tr:first-child > td:first-child": {
            borderTopLeftRadius: "8px !important",
          },
          "& tr:first-child > td:last-child": {
            borderTopRightRadius: "8px !important",
          },
          "& tr:last-child > td:first-child": {
            borderBottomLeftRadius: "8px !important",
          },
          "& tr:last-child > td:last-child": {
            borderBottomRightRadius: "8px !important",
          },
        }}
      >
        <StyledTable
          columns={tableColumns}
          data={data?.docs ?? []}
          customRowRenderers={customRowRenderers}
          loading={isLoading}
          backgroundColor="brandBlue.800"
          size="sm"
        />
      </Box>

      <Pagination pages={data?.totalPages ?? 0} currentPage={page} setPage={setPage} />
      {paginationInfo ? (
        <Text textStyle="sm" color="#A3AEBF" mt={2} textAlign="center">
          {paginationInfo}
        </Text>
      ) : null}
    </>
  );
};

export default ProviderPayableStudiesTable;
