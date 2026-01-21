import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useCreatePaymentIntent } from "../api/StripeApi";
import { useState } from "react";
import { SetupIntent, StripeError } from "@stripe/stripe-js";

const usePayment = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const createPaymentIntent = useCreatePaymentIntent();

  const [error, setError] = useState<StripeError | Error>();

  const setupPayment = async (
    groupId: string,
    onSuccess: (setupIntent: SetupIntent) => void,
    onError: (error: StripeError) => void,
  ) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    try {
      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError);
        return;
      }

      const { clientSecret } = await createPaymentIntent.mutateAsync({ groupId });
      // Confirm the SetupIntent using the details collected by the Payment Element
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        clientSecret,
        redirect: "if_required",
      });

      if (error) {
        // This point is only reached if there's an immediate error when
        // confirming the setup. Show the error to your customer (for example, payment details incomplete)
        setError(error);
        onError(error);
      } else {
        onSuccess(setupIntent);
      }
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Something went wrong"));
    }
    setLoading(false);
  };

  return {
    elements,
    stripe,
    setupPayment,
    loading: loading || createPaymentIntent.isPending,
    error,
  };
};

export default usePayment;
