import React from "react";
import { HStack, Spinner, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

interface Props {
  columns: {
    key: string;
    label: string | React.ReactNode;
  }[];
  data: any[];
  colGroups?: React.ReactNode;
  headerColumns?: React.ReactNode;
  customRenderers?: Record<string, (row: any) => JSX.Element>;
  customRowRenderers?: (row: any) => JSX.Element;
  onClickRow?: (row: any) => void;
  loading?: boolean;
  backgroundColor?: string;
  rowHeight?: number;
  size?: "lg" | "md" | "sm" | "xs";
}
export const StyledTable = ({
  columns,
  data,
  headerColumns,
  colGroups,
  customRenderers,
  customRowRenderers,
  loading = false,
  onClickRow,
  rowHeight = 50,
  backgroundColor = "darkBlue2.900",
  size = "sm",
}: Props): JSX.Element => {
  return (
    <Table variant="unstyled" size={size}>
      {colGroups}
      <Thead>
        {headerColumns ?? (
          <Tr color="gray.500">
            {columns.map((column) => (
              <Th padding={4} key={column.key}>
                {column.label}
              </Th>
            ))}
          </Tr>
        )}
      </Thead>
      <Tbody>
        {loading ? (
          <Tr>
            <Td
              colSpan={headerColumns ? React.Children.count(headerColumns) : columns.length}
            >
              <HStack justify={"center"} h={50} minWidth={"100%"} flex={1}>
                <Spinner color={"brandBlue.800"} />
              </HStack>
            </Td>
          </Tr>
        ) : (
          data.map((row: { id?: string; [key: string]: any }, index) => (
            <Tr
              key={row.id ?? index.toString()}
              backgroundColor={backgroundColor}
              height={`${rowHeight}px`}
              style={{
                cursor: onClickRow ? "pointer" : "default",
              }}
              onClick={() => onClickRow?.(row)}
            >
              {customRowRenderers
                ? customRowRenderers(row)
                : columns.map((column) => (
                    <Td key={column.key}>
                      {customRenderers?.[column.key]
                        ? customRenderers[column.key](row)
                        : row[column.key]}
                    </Td>
                  ))}
            </Tr>
          ))
        )}
      </Tbody>
    </Table>
  );
};
