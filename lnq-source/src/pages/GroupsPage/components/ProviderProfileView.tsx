import { Box, Text, HStack, Tag, Flex, VStack } from "@chakra-ui/react";
import { ProviderProfile } from "../../../types/CurrentUser";

const Label = ({ children }: { children: React.ReactNode }) => (
  <Text color="white" fontWeight={500} fontSize="16px" minW="180px">
    {children}
  </Text>
);
const Value = ({ children }: { children: React.ReactNode }) => (
  <Text color="gray.400" fontWeight={500} fontSize="16px" textAlign="right">
    {children}
  </Text>
);

const ProviderProfileView = ({ provider }: { provider: ProviderProfile }) => {
  if (!provider) return null;
  return (
    <Box
      width="100%"
      minW="400px"
      maxW="1000px"
      alignSelf="flex-start"
      backgroundColor="darkBlue2.900"
      p="32px"
      borderRadius="16px"
    >
      <VStack spacing={4} align="stretch">
        <Flex align="center" justify="space-between">
          <Label>Phone number</Label>
          <Value>{provider.phone ?? ""}</Value>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>Email</Label>
          <Value>{provider.email ?? ""}</Value>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>NPI Number</Label>
          <Value>{provider.providerId ?? ""}</Value>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>Sub Specialty Interests</Label>
          <HStack flexWrap="wrap" justify="flex-end">
            {provider.subSpecialties?.map((item) => (
              <Tag key={item} colorScheme="gray" bg="white" color="brandBlue.800">
                {item}
              </Tag>
            ))}
          </HStack>
        </Flex>
        <Flex align="flex-start" justify="space-between">
          <Label>Provider notes</Label>
          <Text
            color="gray.400"
            fontWeight={400}
            fontSize="16px"
            maxW="60%"
            textAlign="right"
            whiteSpace="pre-line"
          >
            {provider.providerNotes ?? ""}
          </Text>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>Work availability (Days)</Label>
          <HStack flexWrap="wrap" justify="flex-end">
            {provider.workDays?.map((item) => (
              <Tag key={item} colorScheme="gray" bg="white" color="brandBlue.800">
                {item}
              </Tag>
            ))}
          </HStack>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>Work availability (Hours)</Label>
          <HStack flexWrap="wrap" justify="flex-end">
            {provider.workHours?.map((item) => (
              <Tag key={item} colorScheme="gray" bg="white" color="brandBlue.800">
                {item}
              </Tag>
            ))}
          </HStack>
        </Flex>
        <Box>
          <Text color="gray.400" fontWeight={500} fontSize="12px" pb={2} minW="180px">
            Type of work of interest
          </Text>
          <Flex align="center" justify="space-between">
            <Label>Weekdays</Label>
            <Value>{provider.workType?.weekdays ? "Yes" : "No"}</Value>
          </Flex>
        </Box>

        <Flex align="center" justify="space-between">
          <Label>Weekends</Label>
          <Value>{provider.workType?.weekends ? "Yes" : "No"}</Value>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>Swing shifts</Label>
          <Value>{provider.workType?.swing ? "Yes" : "No"}</Value>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>Overnights</Label>
          <Value>{provider.workType?.overnights ? "Yes" : "No"}</Value>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>Dedicated Shifts</Label>
          <Value>{provider.workType?.dedicated ? "Yes" : "No"}</Value>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>RVUs per month interested in</Label>
          <HStack flexWrap="wrap" justify="flex-end">
            {provider.rvus?.map((item) => (
              <Tag key={item} colorScheme="gray" bg="white" color="brandBlue.800">
                {item}
              </Tag>
            ))}
          </HStack>
        </Flex>
        <Flex align="center" justify="space-between">
          <Label>State Medical Licensure</Label>
          <HStack flexWrap="wrap" justify="flex-end">
            {provider.stateLicenses?.map((item) => (
              <Tag key={item} colorScheme="gray" bg="white" color="brandBlue.800">
                {item}
              </Tag>
            ))}
          </HStack>
        </Flex>
      </VStack>
    </Box>
  );
};

export default ProviderProfileView;
