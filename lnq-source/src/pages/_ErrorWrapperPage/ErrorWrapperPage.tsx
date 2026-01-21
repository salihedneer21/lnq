import { useRouteError } from "react-router";
import { Link } from "react-router-dom";
import { Card, CardBody, Flex, Heading, Link as ChakraLink, Text } from "@chakra-ui/react";

import { useUserData } from "../../api/UserApi";
import PageContainer from "../../components/PageContainer";

const ErrorWrapperPage = (): JSX.Element => {
  const error = useRouteError() as {
    status?: number;
    statusText?: string;
    message?: string;
  };
  const { data: currentUser } = useUserData();

  return (
    <PageContainer variant="centered-auth">
      <Card width={640}>
        <CardBody>
          <Heading mt={8} size="lg" textAlign="center">
            Ooops!
          </Heading>
          <Text fontSize="xl" align="center" mt={2} color="gray">
            An unexpected error has occurred.
          </Text>

          <Flex justifyContent="center">
            <Text fontSize="xl" align="center" mt={2} color="red.500">
              {error?.status ? `(${error?.status}) ` : ""}
            </Text>
            <Text
              fontSize="xl"
              align="center"
              mt={2}
              ml={2}
              color="gray.700"
              fontWeight="medium"
            >
              {error?.statusText ?? error?.message}
            </Text>
          </Flex>

          <Flex justifyContent="center" mt={8}>
            <ChakraLink
              as={Link}
              to={`${currentUser ? "/home" : "/login"}`}
              color="brandBlue.800"
              fontWeight="medium"
              fontSize="lg"
              _hover={{ color: "gray.900" }}
            >
              Go to {currentUser ? "home" : "login"}
            </ChakraLink>
          </Flex>
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default ErrorWrapperPage;
