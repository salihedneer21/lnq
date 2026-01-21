import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Text } from "@chakra-ui/react";

import { useConnectStripe } from "../api/StripeApi";
import { useGetMyStudyStats } from "../api/StudyApi";
import { useUserData } from "../api/UserApi";
import { PROVIDER_PAGES } from "../base/router/pages";
import { useHandleModal } from "../hooks/useHandleModal";

const PayOutButton: React.FC = () => {
  const { data: myStudyStatsData } = useGetMyStudyStats();
  const { data: currentUser } = useUserData();
  const navigate = useNavigate();
  const handleModal = useHandleModal();
  const { mutateAsync: connectStripe, isPending: isConnectingStripe } = useConnectStripe();

  const handleStripeConnect = () => {
    connectStripe().then((res) => {
      if (!res.redirectUrl) return console.error("No redirect URL returned from Stripe");
      window.location.href = res.redirectUrl;
    });
  };

  const handleClick = () => {
    if (currentUser?.stripeAccountId) {
      navigate(PROVIDER_PAGES.stripePayout);
    } else {
      handleModal({
        title: "Connect your account to Stripe",
        subtitle:
          "We use Stripe to make sure you get paid on time and keep your personal and bank details secure.",
        leftButtonTitle: "Cancel",
        rightButtonTitle: "Set Up Payment",
        onClickRightButton: handleStripeConnect,
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="sm"
      whiteSpace="break-spaces"
      colorScheme="whiteAlpha"
      isLoading={isConnectingStripe}
    >
      {currentUser?.stripeAccountId ? (
        <>
          <Text textStyle="bodyBold" color="white">
            ${myStudyStatsData?.payoutPaymentAmount?.toFixed(2) ?? "0.00"}{" "}
          </Text>
          <Text textStyle="bodyBold" color="brandYellow.600">
            Pay Now
          </Text>
        </>
      ) : (
        <Text textStyle="bodyBold" color="brandYellow.600">
          Set Up Payment
        </Text>
      )}
    </Button>
  );
};

export default PayOutButton;
