import { useMutation } from "@tanstack/react-query";
import useApi from "./hooks/useApi";

export const useConnectStripe = () => {
  const { requestFn } = useApi<{
    redirectUrl: string;
  }>({
    url: "/stripe/authorize",
    method: "POST",
  });

  return useMutation({ mutationFn: () => requestFn() });
};

export const useCreateLoginLink = () => {
  const { requestFn } = useApi<
    {
      redirectUrl: string;
    },
    { route: "transactions" | "home" }
  >({
    url: "/stripe/loginLink",
    method: "GET",
  });

  return useMutation({
    mutationFn: (data: { route: "transactions" | "home" }) => requestFn(data),
  });
};

export const useCreatePaymentIntent = () => {
  const { requestFn } = useApi<
    {
      clientSecret: string;
    },
    { groupId: string }
  >({
    url: `/group/stripePaymentIntent`,
    method: "POST",
  });

  return useMutation({ mutationFn: (data: { groupId: string }) => requestFn(data) });
};
