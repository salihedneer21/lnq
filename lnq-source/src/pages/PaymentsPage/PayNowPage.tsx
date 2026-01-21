import { Button, Divider, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { useCreateLoginLink } from "../../api/StripeApi";
import { useGetMyStudyStats } from "../../api/StudyApi";
import StudyStatsCard from "../../components/StudyStatsCard/StudyStatsCard";
import ProfileCard from "./components/ProfileCard";
import { useRef } from "react";
import { PayoutModal } from "../../components/PayoutModal/PayoutModal";

export const PayNowPage = () => {
  const modalRef = useRef<{ open: () => void } | null>(null);
  const { mutateAsync: createLoginLink, isPending: isCreatingLoginLink } =
    useCreateLoginLink();
  const { data: myStudyStatsData } = useGetMyStudyStats();

  const handleLinkClick = () => {
    createLoginLink({ route: "transactions" }).then((res) => {
      if (!res.redirectUrl) return console.error("No redirect URL returned from Stripe");
      window.open(res.redirectUrl, "_blank");
    });
  };

  const handlePayNow = () => {
    modalRef.current?.open();
  };

  return (
    <>
      <Text textStyle={"h5"} mb={10}>
        Pay Now
      </Text>
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing="24px" mb="32px">
        <ProfileCard />
        <StudyStatsCard
          backgroundColor="#32E484"
          title="Studies Pending Payment"
          subtitle={`${myStudyStatsData?.studiesPendingPayment ?? 0}`}
        />
        <StudyStatsCard
          backgroundColor="#91B6FE"
          title="RVU's pending payment"
          subtitle={`${myStudyStatsData?.rvusPendingPayment?.toFixed(2) ?? 0}`}
        />
        <StudyStatsCard
          backgroundColor="brandYellow.600"
          title="Earnings Available for Pay Now"
          subtitle={`$${myStudyStatsData?.payoutPaymentAmount?.toFixed(2) ?? 0}`}
        />
        <StudyStatsCard
          backgroundColor="orange.400"
          title="Pending Balance"
          subtitle={`$${myStudyStatsData?.pendingPaymentAmount?.toFixed(2) ?? 0}`}
        />
        <StudyStatsCard
          backgroundColor="green.400"
          title="Total Lifetime Earnings"
          subtitle={`$${myStudyStatsData?.totalLifetimeEarnings?.toFixed(2) ?? 0}`}
        />
      </SimpleGrid>
      <Divider mb="32px" color="gray.600" />
      <HStack flexDir="row-reverse" spacing="24px">
        <Button
          fontWeight="700"
          variant="solid"
          colorScheme="brandYellow"
          textColor="brandBlue.800"
          onClick={() => handlePayNow()}
        >
          Pay Out Now
        </Button>
        <Button
          fontWeight="700"
          variant="outline"
          color="white"
          isLoading={isCreatingLoginLink}
          onClick={() => handleLinkClick()}
        >
          View Payouts on Stripe
        </Button>

        <PayoutModal ref={modalRef} />
      </HStack>
    </>
  );
};
