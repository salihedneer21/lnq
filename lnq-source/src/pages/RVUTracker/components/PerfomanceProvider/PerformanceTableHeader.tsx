import { Box, Text, Flex, useBreakpointValue } from "@chakra-ui/react";
import { COLORS } from "../types";

const LEGEND_COLORS: Record<string, string> = {
  "LnQ RVUs": COLORS.lnqRVUs,
  "Total RVUs": COLORS.rvus,
  "Total Studies": COLORS.studies,
};

export const PerformanceTableHeader: React.FC = () => {
  const textSize = useBreakpointValue({ base: "10px", md: "11px", lg: "12px" });

  const createLegendLabel = (label: string, color: string) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            backgroundColor: color,
            borderRadius: "50%",
          }}
        />
        <span
          style={{
            fontWeight: "medium",
            color: "white",
            fontSize: textSize,
            whiteSpace: "nowrap",
            padding: "8px",
          }}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <Box
      w="100%"
      px={2}
      mb={1}
      position="sticky"
      top={0}
      zIndex={10}
      bg={COLORS.background}
      py={2}
      pl={4}
    >
      <Flex w="100%" alignItems="center">
        <Box
          w="250px"
          display="flex"
          alignItems="center"
          justifyContent="flex-start"
          h="100%"
        >
          <Text fontWeight="medium" color="white" fontSize={textSize} whiteSpace="nowrap">
            Provider
          </Text>
        </Box>
        <Box w="150px" h="100%">
          {createLegendLabel("LnQ RVUs", LEGEND_COLORS["LnQ RVUs"])}
        </Box>
        <Box w="150px" h="100%">
          {createLegendLabel("Total RVUs", LEGEND_COLORS["Total RVUs"])}
        </Box>
        <Box w="150px" h="100%">
          {createLegendLabel("Total Studies", LEGEND_COLORS["Total Studies"])}
        </Box>
      </Flex>
    </Box>
  );
};
