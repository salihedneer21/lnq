import { format, parse, startOfMonth, subMonths } from "date-fns";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Collapse,
  Flex,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Progress,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import { useGetGroupMonthlyReport } from "../../../api/GroupApi";
import { Pagination } from "../../../components/Pagination/Pagination.tsx";
import { useStreamMonthlyReportCSV } from "../../../hooks/useStreamMonthlyReportCSV";

dayjs.extend(utc);
dayjs.extend(timezone);

interface SummaryReportProps {
  groupId: string;
  month?: string;
  onMonthChange?: (month: string) => void;
}

const SummaryReport: React.FC<SummaryReportProps> = ({ groupId, month, onMonthChange }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const availableMonths = useMemo(() => {
    const months = [];
    const today = new Date();
    const currentMonth = startOfMonth(today);
    for (let i = 1; i <= 12; i++) {
      const date = subMonths(currentMonth, i);
      months.push({
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy"),
      });
    }
    return months;
  }, []);

  const defaultMonth = useMemo(() => {
    if (month) return month;
    if (availableMonths.length > 0) return availableMonths[0].value;
    return format(subMonths(new Date(), 1), "yyyy-MM");
  }, [month, availableMonths]);

  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

  useEffect(() => {
    if (month) {
      setSelectedMonth(month);
    }
  }, [month]);

  useEffect(() => {
    setPage(1);
  }, [selectedMonth, searchQuery]);

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  // grab the user's utc offset from the browser
  const utcOffset = new Date().getTimezoneOffset();

  const {
    data: reportData,
    isLoading,
    error,
  } = useGetGroupMonthlyReport(groupId, selectedMonth, utcOffset);

  const { streamReport, isStreaming, progress } = useStreamMonthlyReportCSV({
    groupId,
    month: selectedMonth,
    utcOffset,
  });

  const handleExport = () => {
    if (!flattenedStudies.length) return;
    streamReport();
  };

  const filteredProviders = useMemo(() => {
    if (!reportData?.providers) return [];
    return reportData.providers.filter((p) => {
      const searchTerm = searchQuery.toLowerCase().trim();
      const providerName = p.providerName
        ? p.providerName.split(" - ")[0].toLowerCase()
        : "";
      const providerId = p.providerId ?? "";
      return providerName.includes(searchTerm) ?? providerId.includes(searchTerm);
    });
  }, [reportData, searchQuery]);

  const paginatedProviders = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredProviders.slice(startIndex, endIndex);
  }, [filteredProviders, page, perPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProviders.length / perPage);
  }, [filteredProviders.length, perPage]);

  const paginationInfo = reportData
    ? `Showing ${(page - 1) * perPage + 1}-${Math.min(
        page * perPage,
        filteredProviders.length,
      )} of ${filteredProviders.length} results`
    : "";

  const flattenedStudies = useMemo(() => {
    if (!reportData?.providers) return [];

    return reportData.providers.flatMap((provider) => {
      return provider.codeYellowGroups.map((group) => ({
        providerName: provider.providerName,
        providerId: provider.providerId,
        prevailingCodeYellow: group.prevailingCodeYellow,
        startDate: group.startDate,
        endDate: group.endDate,
        rvus: group.totalRvus,
        payment: group.totalPayment,
      }));
    });
  }, [reportData]);

  const formatDateAmerican = (dateString: string | null | undefined) => {
    if (!dateString) return "-";

    try {
      return dayjs(dateString).format("MM/DD/YYYY");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatMonthName = (dateString: string) => {
    try {
      const date = parse(dateString, "yyyy-MM", new Date());
      return format(date, "MMMM yyyy");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner color="yellow.400" size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Text color="red.400">Error loading report: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={2} gap={4}>
        <Input
          placeholder="Select provider or search by name or NPI"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          width="400px"
          bg="whiteAlpha.50"
          border="1px solid"
          borderColor="whiteAlpha.200"
          color="white"
          _placeholder={{ color: "whiteAlpha.500" }}
        />
        <Menu>
          <MenuButton
            as={Button}
            width="180px"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.200"
            color="white"
            _hover={{ bg: "whiteAlpha.100" }}
            _focus={{ bg: "whiteAlpha.100" }}
            rightIcon={<span style={{ marginLeft: 8 }}>▼</span>}
          >
            {availableMonths.find((m) => m.value === selectedMonth)?.label}
          </MenuButton>
          <MenuList
            borderColor="whiteAlpha.200"
            minW="180px"
            p={0}
            zIndex={20}
            backgroundColor="darkBlue2.900"
          >
            {availableMonths.map((month) => (
              <MenuItem
                key={month.value}
                bg={month.value === selectedMonth ? "yellow.400" : "whiteAlpha.50"}
                color={month.value === selectedMonth ? "darkBlue2.900" : "white"}
                fontWeight={month.value === selectedMonth ? "semibold" : "normal"}
                _hover={{
                  bg: month.value === selectedMonth ? "yellow.500" : "darkBlue2.900",
                }}
                onClick={() => handleMonthChange(month.value)}
                justifyContent="space-between"
              >
                <span>{month.label}</span>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>

      <Flex justifyContent="center" mb={6} direction="column" align="center" gap={2}>
        <Button
          variant="outline"
          onClick={handleExport}
          borderColor="yellow.400"
          color="yellow.400"
          _hover={{ bg: "whiteAlpha.100" }}
          isDisabled={!flattenedStudies.length || isStreaming}
          isLoading={isStreaming}
          loadingText={`Exporting... ${progress.toFixed(0)}%`}
        >
          Export
        </Button>
        {isStreaming && (
          <Box w="300px">
            <Progress
              value={progress}
              size="xs"
              colorScheme="yellow"
              bg="whiteAlpha.100"
              borderRadius="full"
            />
          </Box>
        )}
      </Flex>

      <TableContainer
        height="calc(100vh - 224px)"
        overflowY="auto"
        overflowX="auto"
        sx={{
          "& > table > thead": {
            position: "sticky",
            top: "-4px",
            zIndex: "docked",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            backgroundColor: "darkBlue2.900",
          },
          "& > table > thead th": {
            position: "sticky",
            top: 0,
            zIndex: "docked",
          },
        }}
      >
        <Table variant="unstyled">
          <Thead>
            <Tr>
              <Th color="whiteAlpha.600" fontWeight="normal">
                Radiologist Name
              </Th>
              <Th color="whiteAlpha.600" fontWeight="normal" textAlign="right">
                Total Payable RVUs
              </Th>
              <Th color="whiteAlpha.600" fontWeight="normal" textAlign="right">
                Total Payment
              </Th>
              <Th color="whiteAlpha.600" fontWeight="normal">
                Date
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedProviders.map((provider) => (
              <React.Fragment key={provider.providerId}>
                <Tr
                  bg="whiteAlpha.50"
                  _hover={{ bg: "whiteAlpha.100" }}
                  cursor="pointer"
                  onClick={() =>
                    setExpandedProvider(
                      expandedProvider === provider.providerId ? null : provider.providerId,
                    )
                  }
                >
                  <Td color="white" fontWeight="medium">
                    <Flex alignItems="center">
                      <IconButton
                        aria-label={
                          expandedProvider === provider.providerId
                            ? "Collapse studies"
                            : "Expand studies"
                        }
                        icon={
                          expandedProvider === provider.providerId ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          )
                        }
                        size="sm"
                        variant="ghost"
                        mr={2}
                        color="white"
                      />
                      {provider.providerName
                        ? provider.providerName.split(" - ")[0]
                        : "N/A"}
                    </Flex>
                  </Td>
                  <Td color="white" textAlign="right">
                    {Number(provider.totalRvus).toFixed(2)}
                  </Td>
                  <Td color="white" textAlign="right">
                    ${Number(provider.totalPayment).toFixed(2)}
                  </Td>
                  <Td color="white">{formatMonthName(selectedMonth)}</Td>
                </Tr>
                <Tr>
                  <Td colSpan={4} p={0}>
                    <Collapse in={expandedProvider === provider.providerId}>
                      <Table variant="unstyled" width="100%">
                        <Thead>
                          <Tr>
                            <Th color="whiteAlpha.800" pl={12}>
                              LnQ:
                            </Th>
                            <Th color="whiteAlpha.800" textAlign="right">
                              Total RVUs
                            </Th>
                            <Th color="whiteAlpha.800" textAlign="right">
                              Total Payment
                            </Th>
                            <Th color="whiteAlpha.800">Date Range</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {provider.codeYellowGroups.map((group) => (
                            <Tr key={group.prevailingCodeYellow} bg="whiteAlpha.100">
                              <Td color="whiteAlpha.800" pl={12}>
                                {group.displayLabel}
                              </Td>
                              <Td color="whiteAlpha.800" textAlign="right">
                                {Number(group.totalRvus).toFixed(2)}
                              </Td>
                              <Td color="whiteAlpha.800" textAlign="right">
                                ${Number(group.totalPayment).toFixed(2)}
                              </Td>
                              <Td color="whiteAlpha.800">
                                {`${formatDateAmerican(group.startDate)} - `}
                                {group.endDate ? formatDateAmerican(group.endDate) : "N/A"}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Collapse>
                  </Td>
                </Tr>
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Box mt={4} display="flex" flexDirection="column" alignItems="center">
        <Pagination pages={totalPages} currentPage={page} setPage={setPage} />

        {paginationInfo && (
          <Text textStyle="sm" color="#A3AEBF" mt={2} textAlign="center">
            {paginationInfo}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default SummaryReport;
