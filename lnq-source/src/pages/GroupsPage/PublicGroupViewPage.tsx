import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useGetGroup } from "../../api/GroupApi";
import { PROVIDER_PAGES } from "../../base/router/pages";
import { timeZoneFullNames } from "../../utils/timeZones.ts";

export const PublicGroupViewPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { data: groupData, isLoading, error } = useGetGroup(groupId);

  const handleBack = () => {
    navigate(`${PROVIDER_PAGES.groups}?tab=allgroups`);
  };

  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" color="brandYellow.500" />
        <Text mt={4} color="gray.400">
          Loading group information...
        </Text>
      </Box>
    );
  }

  if (error ?? !groupData?.group) {
    return (
      <Box p={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Loading Error</AlertTitle>
            <AlertDescription>
              Failed to load group information. Please refresh the page.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  const { group } = groupData;
  let highRvuValue: string;
  let lowRvuValue: string;
  let recentRvuValue: string;

  if (!group.rvuRateVisible) {
    highRvuValue = "TBD";
    lowRvuValue = "TBD";
    recentRvuValue = "TBD";
  } else {
    highRvuValue = group.usdPerRvuHigh ? `$${group.usdPerRvuHigh}` : "N/A";
    lowRvuValue = group.usdPerRvuLow ? `$${group.usdPerRvuLow}` : "N/A";
    recentRvuValue = group.usdPerRvuRecent ? `$${group.usdPerRvuRecent}` : "N/A";
  }

  return (
    <>
      <Box mt="24px">
        <Button
          leftIcon={<FiArrowLeft />}
          variant="link"
          onClick={handleBack}
          color="white"
        >
          Groups
        </Button>
        <Text fontSize="3xl" fontWeight="700" color="white">
          {group.facilityName}
        </Text>
      </Box>

      <Grid mt={20} templateColumns="repeat(3, 1fr)">
        <GridItem textStyle="h5">Group Information</GridItem>
        <GridItem colSpan={2} backgroundColor="darkBlue2.900" p="24px" borderRadius="16px">
          <Grid gap={4}>
            <Box>
              <Text fontSize="lg" fontWeight="600" color="gray.300" mb={2}>
                Phone
              </Text>
              <Text color="white" fontSize="md">
                {group.phone ?? "Not specified"}
              </Text>
            </Box>

            <Box>
              <Text fontSize="lg" fontWeight="600" color="gray.300" mb={2}>
                Description
              </Text>
              <Text color="white" fontSize="md" lineHeight="1.6">
                {group.description ?? "No description available"}
              </Text>
            </Box>

            <Box>
              <Text fontSize="lg" fontWeight="600" color="gray.300" mb={2}>
                Time Zone
              </Text>
              <Text color="white" fontSize="md">
                {group.timeZone ? timeZoneFullNames[group.timeZone] : "Not specified"}
              </Text>
            </Box>
          </Grid>
        </GridItem>
      </Grid>

      <Grid mt={16} templateColumns="repeat(3, 1fr)">
        <GridItem textStyle="h5">RVU Rates</GridItem>
        <GridItem colSpan={2} backgroundColor="darkBlue2.900" p="24px" borderRadius="16px">
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap={6}>
            <GridItem>
              <Box
                p={4}
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.600"
              >
                <Text fontSize="sm" fontWeight="500" color="gray.400" mb={1}>
                  Highest $/RVU
                </Text>
                <Text fontSize="2xl" fontWeight="700" color="brandYellow.500">
                  {highRvuValue}
                </Text>
              </Box>
            </GridItem>

            <GridItem>
              <Box
                p={4}
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.600"
              >
                <Text fontSize="sm" fontWeight="500" color="gray.400" mb={1}>
                  Lowest $/RVU
                </Text>
                <Text fontSize="2xl" fontWeight="700" color="brandYellow.500">
                  {lowRvuValue}
                </Text>
              </Box>
            </GridItem>

            <GridItem>
              <Box
                p={4}
                bg="rgba(255, 255, 255, 0.05)"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.600"
              >
                <Text fontSize="sm" fontWeight="500" color="gray.400" mb={1}>
                  Recent $/RVU
                </Text>
                <Text fontSize="2xl" fontWeight="700" color="brandYellow.500">
                  {recentRvuValue}
                </Text>
              </Box>
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </>
  );
};
