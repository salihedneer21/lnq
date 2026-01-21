import { VStack, Box, Container, Spinner, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { useGetDailyRVUTracker } from "../../../../api/StudyApi";
import { useGetProvidersInGroup } from "../../../../api/GroupApi";
import { useUserData } from "../../../../api/UserApi";
import { DailyRVUStat } from "../../../../types/DailyRVUStat";
import { PerformanceTableHeader } from "./PerformanceTableHeader";
import { COLORS } from "../types";
import { PerfomanceProviderRow } from "./PerfomanceProviderRow";

interface PerformanceViewProps {
  date: Date;
  groupId?: string;
}

const PerformanceView: React.FC<PerformanceViewProps> = ({ date, groupId }) => {
  const { data, isLoading } = useGetDailyRVUTracker(date, groupId);
  const { data: groupProvidersData } = useGetProvidersInGroup(groupId, 1, 0, {});
  const { data: currentUser } = useUserData();

  const lnqRVUs = data?.groupTotalCYRVUs.toFixed(2) ?? 0;
  const totalRVUs = data?.groupTotalRVUs.toFixed(2) ?? 0;

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

  const largestTotalValue = useMemo(() => {
    return Math.max(
      ...filteredData.map((doc) => {
        const lnqRVUs = Math.ceil(doc.totalCYRVUs ?? 0);
        const totalRVUs = Math.ceil(doc.totalRVUs ?? 0);
        const totalStudies = Math.ceil(doc.totalStudies ?? 0);

        return lnqRVUs + totalRVUs + totalStudies;
      }),
      0,
    );
  }, [filteredData]);

  const fte = lnqRVUs ? (Number(lnqRVUs) / 80).toFixed(2) : 0;

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
          <Container maxW="full" px={0} position="relative">
            <Box position="relative" maxH="60vh" overflowY="auto">
              <PerformanceTableHeader />
              <Box position="relative">
                <Box
                  position="absolute"
                  top={0}
                  left="290px"
                  right={0}
                  bottom={0}
                  zIndex={0}
                  pointerEvents="none"
                ></Box>
                <VStack align="stretch" position="relative" zIndex={2} spacing={1}>
                  {filteredData.map((provider, index) => (
                    <Box
                      key={provider.userId ?? index}
                      position="relative"
                      overflow="hidden"
                    >
                      <PerfomanceProviderRow
                        provider={provider}
                        largestTotalValue={largestTotalValue}
                      />
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          </Container>
        )}
      </Box>
      <VStack align="flex-start" spacing={2} mt={4}>
        <Text
          textStyle="bodyBold"
          color="black"
          bg="#F7E376"
          px={2}
          py={1}
          borderRadius="6px"
        >
          LnQ RVU Count {lnqRVUs} = {fte} LnQ Virtual FTE
        </Text>
        <Text textStyle="bodyBold" color="white">
          Total Group RVU&apos;s {totalRVUs}
        </Text>
      </VStack>
    </VStack>
  );
};

export default PerformanceView;
