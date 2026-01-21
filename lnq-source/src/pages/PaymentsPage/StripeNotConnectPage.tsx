import { Button, Center, Text, VStack } from "@chakra-ui/react";
import { useConnectStripe } from "../../api/StripeApi";

export const StripeNotConnectPage = () => {
  const { mutateAsync: connectStripe, isPending: isConnectingStripe } = useConnectStripe();

  const handleClick = () => {
    connectStripe().then((res) => {
      if (!res.redirectUrl) return console.error("No redirect URL returned from Stripe");
      window.location.href = res.redirectUrl;
    });
  };

  return (
    <Center pt={"10%"}>
      <VStack spacing={4}>
        <Text textStyle={"smMdSemi"} fontSize={"2xl"}>
          Connect your account to Stripe
        </Text>
        <Text>
          We use Stripe to make sure you get paid on time and keep your personal and bank
          details secure.
        </Text>
        <Button
          colorScheme="brandYellow"
          w={"48%"}
          onClick={handleClick}
          isLoading={isConnectingStripe}
        >
          <Text color={"brandBlue.800"} fontSize={"sm"}>
            Set Up Payments
          </Text>
        </Button>
      </VStack>
    </Center>
  );
};
