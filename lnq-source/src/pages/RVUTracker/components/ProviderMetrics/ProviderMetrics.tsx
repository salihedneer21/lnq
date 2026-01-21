import {
  VStack,
  Box,
  Container,
  Spinner,
  Text,
  Tr,
  Th,
  Table,
  Thead,
  Tbody,
  Td,
} from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { useGetProvidersInGroup } from "../../../../api/GroupApi";
import { useGetDailyRVUTracker } from "../../../../api/StudyApi";
import { useUserData } from "../../../../api/UserApi";
import { DailyRVUStat } from "../../../../types/DailyRVUStat";
// import { ProviderMetricsTableHeader } from "./ProviderMetricsTableHeader";
import { COLORS } from "../types";
// import { ProviderMetricsRow } from "./ProviderMetricsRow";
import { StickyTableContainer } from "~/components/StyledTable";

interface ProviderMetricsProps {
  date: Date;
  groupId?: string;
}

const ProviderMetrics: React.FC<ProviderMetricsProps> = ({ date, groupId }) => {
  const { data, isLoading } = useGetDailyRVUTracker(date, groupId);
  const { data: groupProvidersData } = useGetProvidersInGroup(groupId, 1, 0, {});
  const { data: currentUser } = useUserData();

  const rvuTrackerVisibility = groupProvidersData?.providers?.find(
    (p) => p.user?.id === currentUser?.id,
  )?.rvuTrackerVisibility;

  const filteredData = useMemo(() => {
    if (!data?.docs) return [];

    const hasNonZeroValues = (doc: DailyRVUStat) =>
      doc.totalRVUs > 0 ||
      doc.totalCYRVUs > 0 ||
      doc.totalStudies > 0 ||
      doc.unmappedStudies > 0;

    if (rvuTrackerVisibility === "view_self" && currentUser) {
      const userData = data.docs.find((doc) => doc.userId === currentUser.id);
      return userData && hasNonZeroValues(userData) ? [userData] : [];
    }

    return data.docs.filter(hasNonZeroValues);
  }, [data?.docs, rvuTrackerVisibility, currentUser]);

  if (isLoading) {
    return (
      <Container maxW="full" px={0}>
        <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
          <Spinner size="lg" color="white" />
        </Box>
      </Container>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box bg={COLORS.background} p={6}>
        {filteredData.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text color="gray.400" fontSize="lg">
              No RVU data available for selected date
            </Text>
          </Box>
        ) : (
          <StickyTableContainer variant="spaced">
            <Table variant="unstyled" size="sm">
              <Thead>
                <Tr h="16" color="gray.500">
                  <Th style={{ width: "15%" }}>Provider</Th>
                  <Th style={{ width: "20%" }}>Shift</Th>
                  <Th style={{ width: "15%" }}>Shift RVU vs RVU Goal</Th>
                  <Th style={{ width: "15%" }}>RVU/Exam Ratio</Th>
                  <Th style={{ width: "10%" }}>Shift RVUs</Th>
                  <Th style={{ width: "10%" }}>LnQ RVUs</Th>
                  <Th style={{ width: "15%" }}>RVUs over Target</Th>
                  <Th style={{ width: "15%" }}>Total RVUs</Th>
                  <Th style={{ width: "15%" }}>Total Studies</Th>
                  <Th style={{ width: "15%" }}>Unmapped Studies</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map((provider, index) => (
                  <Tr
                    key={provider.userId ?? index}
                    height="50px"
                    backgroundColor="darkBlue2.900"
                  >
                    <Td>{provider.name}</Td>
                    <Td>{provider.shifts.join(", ")}</Td>
                    <Td
                      color={
                        provider.rvuTarget > 0
                          ? provider.totalShiftRVUs >= provider.rvuTarget
                            ? "#69CE53"
                            : "#FE5F55"
                          : "white"
                      }
                    >
                      {provider.rvuTarget === 0
                        ? "N/A"
                        : `${
                            Number.isInteger(provider.totalShiftRVUs)
                              ? provider.totalShiftRVUs
                              : provider.totalShiftRVUs.toFixed(2)
                          }/${provider.rvuTarget} (${provider.percentOfTarget}%)`}
                    </Td>
                    <Td>
                      {Number.isInteger(provider.rvuToExamRatio)
                        ? provider.rvuToExamRatio
                        : provider.rvuToExamRatio.toFixed(2)}
                    </Td>
                    <Td>{provider.totalShiftRVUs.toFixed(2)}</Td>
                    <Td>{provider.totalCYRVUs.toFixed(2)}</Td>
                    <Td>{provider.rvusOverTarget.toFixed(2)}</Td>
                    <Td>{provider.totalRVUs.toFixed(2)}</Td>
                    <Td>{provider.totalStudies}</Td>
                    <Td>{provider.unmappedStudies}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </StickyTableContainer>
        )}
      </Box>
    </VStack>
  );
};

export default ProviderMetrics;
