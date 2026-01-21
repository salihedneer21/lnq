import { Box, CircularProgress, VStack, Text } from "@chakra-ui/react";

export const FullPageLoader = () => {
  return (
    <Box
      as="output"
      aria-label="Loading"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        minHeight: "40vh",
      }}
    >
      <Box
        bg="brandBlue.800"
        borderRadius="12px"
        px={6}
        py={5}
        boxShadow="lg"
        display="flex"
        alignItems="center"
        gap={4}
      >
        <VStack spacing={0} align="center">
          <CircularProgress
            isIndeterminate
            color="primary.900"
            thickness="8px"
            size="48px"
          />
        </VStack>

        <VStack spacing={0} align="flex-start">
          <Text color="white" fontWeight={700} fontSize="lg">
            Loading…
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};
