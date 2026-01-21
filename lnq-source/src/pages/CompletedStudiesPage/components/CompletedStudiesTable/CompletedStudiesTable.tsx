import React, { useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { StyledTable, StickyTableContainer } from "../../../../components/StyledTable";
import { HeaderCell } from "./HeaderCell";
import { Study } from "../../../../types/Study";
import CompletedStudiesRow from "./CompletedStudiesRow";
import { Pagination } from "../../../../components/Pagination/Pagination";
import { useGetMyStudies } from "../../../../api/StudyApi";

const CompletedStudiesTable: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const [perPage] = React.useState(25);
  const { data: myStudiesData, isLoading: isGettingMyStudies } = useGetMyStudies(
    page,
    perPage,
    true,
  );

  useEffect(() => {
    if (myStudiesData?.currentPage) {
      setPage(myStudiesData.currentPage);
    }
  }, [myStudiesData?.currentPage]);

  const tableColumns: HeaderCell[] = [
    { key: "orderCode", label: "Facility Code" },
    { key: "orderDescription", label: "Order Description" },
    { key: "facility", label: "Worklist" },
    { key: "rvus", label: "RVU" },
    { key: "dollarAmount", label: "Dollars" },
    { key: "dateFinalized", label: "Date Finalized" },
    { key: "paymentStatus", label: "Payment Status" },
    { key: "paymentStatusReason", label: "Payable Over Target" },
  ] as const;

  const studyRow = (study: Study) => <CompletedStudiesRow study={study} />;

  return (
    <Box>
      <StickyTableContainer variant="spaced">
        <StyledTable
          columns={tableColumns}
          data={myStudiesData?.docs ?? []}
          customRowRenderers={studyRow}
          loading={isGettingMyStudies}
          size="sm"
        />
      </StickyTableContainer>
      <Pagination
        pages={myStudiesData?.totalPages ?? 0}
        currentPage={page}
        setPage={setPage}
      />
    </Box>
  );
};

export default CompletedStudiesTable;
