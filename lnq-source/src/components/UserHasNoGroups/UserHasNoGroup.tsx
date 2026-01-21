import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const UserHasNoGroup = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/groups?tab=allgroups");
  };

  return (
    <Box p={8} borderRadius="lg" textAlign="center" maxW="sm" mx="auto" mt="100px">
      <VStack spacing={0}>
        <Text fontSize="24px" fontWeight="bold" color="white">
          Welcome to LnQ.
        </Text>
        <Text fontSize="24px" fontWeight="bold" color="white">
          To get started make sure to join at least one group.
        </Text>
        <Button
          colorScheme="yellow"
          bg="#ECC94B"
          color="#2E3192"
          fontSize={18}
          width={"100%"}
          _hover={{ bg: "#D69E2E" }}
          onClick={handleButtonClick}
          mt={6}
        >
          Take me to Groups
        </Button>
      </VStack>
    </Box>
  );
};

export default UserHasNoGroup;
