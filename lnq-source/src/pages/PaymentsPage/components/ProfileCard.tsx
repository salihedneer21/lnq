import { Button, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { assetIcons } from "../../../constants/icons";
import { useCreateLoginLink } from "../../../api/StripeApi";
import { useUserData } from "../../../api/UserApi";

const ProfileCard: React.FC = () => {
  const { data: user } = useUserData();
  const { mutateAsync: createLoginLink, isPending: isCreatingLoginLink } =
    useCreateLoginLink();

  const handleLinkClick = () => {
    createLoginLink({ route: "home" }).then((res) => {
      if (!res.redirectUrl) return console.error("No redirect URL returned from Stripe");
      window.open(res.redirectUrl, "_blank");
    });
  };
  return (
    <HStack backgroundColor="#FF9760" w="100%" p={6} borderRadius="8px">
      <Image color="white" src={assetIcons.userOutline} boxSize="64px" objectFit="cover" />
      <VStack alignItems="left">
        <Text textStyle="body" color="gray.900">
          {user?.firstName} {user?.lastName}
        </Text>
        <Button
          variant="link"
          colorScheme="brandYellow"
          onClick={() => handleLinkClick()}
          isLoading={isCreatingLoginLink}
          whiteSpace="break-spaces"
          textAlign="left"
        >
          STRIPE ACCOUNT
        </Button>
      </VStack>
    </HStack>
  );
};

export default ProfileCard;
