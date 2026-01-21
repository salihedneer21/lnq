import { HStack, Text, Box } from "@chakra-ui/react";
import type { DailyRVUStat } from "../../../../types/DailyRVUStat";
import { ProgressBar } from "../ProgressBar";

interface PerfomanceProviderRowProps {
  provider: DailyRVUStat;
  largestTotalValue: number;
}

export const PerfomanceProviderRow = ({
  provider,
  largestTotalValue,
}: PerfomanceProviderRowProps) => {
  const shiftData = {
    id: "aggregated",
    name: "aggregated",
    lnqRVUs: provider.totalCYRVUs,
    totalRVUs: provider.totalRVUs,
    totalStudies: provider.totalStudies,
    unmappedStudies: provider.unmappedStudies,
    rvuTarget: provider.rvuTarget,
    percentOfTarget: provider.percentOfTarget,
  };

  return (
    <Box
      alignItems="center"
      borderRadius="10px"
      position="relative"
      zIndex={2}
      bg="#23233D"
      px={4}
      py={1}
      mb={0}
      display="flex"
    >
      <HStack align="center" spacing={2} flex="1" alignItems="center">
        <Box
          minW="120px"
          maxW="260px"
          w="100%"
          minH="32px"
          display="flex"
          alignItems="center"
        >
          <Text
            color="white"
            fontSize="14px"
            fontWeight="bold"
            whiteSpace="normal"
            wordBreak="break-word"
          >
            {provider.name}
          </Text>
        </Box>

        <ProgressBar shift={shiftData} largestTotalValue={largestTotalValue} />
      </HStack>
    </Box>
  );
};
