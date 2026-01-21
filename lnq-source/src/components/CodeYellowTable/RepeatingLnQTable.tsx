import React from "react";
import { Table, Tbody, Td, Th, Thead, Tr, HStack, Spinner } from "@chakra-ui/react";
import { LnqRepeat } from "../../types/CodeYellow";
import RepeatingLnQRow from "./RepeatingLnQRow";

interface RepeatingLnQTableProps {
  data: LnqRepeat[];
  loading?: boolean;
}

export const RepeatingLnQTable: React.FC<RepeatingLnQTableProps> = ({
  data,
  loading = false,
}) => {
  return (
    <Table variant="unstyled" size="sm">
      <Thead>
        <Tr color="gray.500">
          <Th>LnQ Name</Th>
          <Th>Start Time</Th>
          <Th>End Time</Th>
          <Th>Activated By</Th>
          <Th>Targeted Providers</Th>
          <Th>$/RVU</Th>
          <Th>Recurrence</Th>
          <Th>Status</Th>
          <Th>End Date</Th>
          <Th></Th>
        </Tr>
      </Thead>
      <Tbody>
        {loading ? (
          <Tr>
            <Td colSpan={10}>
              <HStack justify={"center"} h={50} minWidth={"100%"} flex={1}>
                <Spinner color={"brandBlue.800"} />
              </HStack>
            </Td>
          </Tr>
        ) : (
          data.map((lnqRepeat, index) => (
            <RepeatingLnQRow key={lnqRepeat.id ?? index.toString()} lnqRepeat={lnqRepeat} />
          ))
        )}
      </Tbody>
    </Table>
  );
};
