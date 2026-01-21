import useApi from "./hooks/useApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePayoutAllGroupedUnpaidStudies = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message?: string;
    redirectUrl?: string;
  }>({
    url: "/payoutAll",
    method: "POST",
  });

  return useMutation({
    mutationFn: () => requestFn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myStudies"] });
      queryClient.invalidateQueries({ queryKey: ["myStudyStats"] });
    },
  });
};
export interface GetGroupedUnpaidStudiesResponse {
  totalAmount: number;
  totalAmountWithFee: number;
  items: {
    dollarAmount: string;
    dollarAmountWithFee: number;
    rvus: string;
    pendingStudiesCount: number;
    id: string;
    facilityName: string;
    payoutEnabled: boolean;
    preferredPaymentMethodType: "card" | "us_bank_account";
    providerId: string;
  }[];
}
export const useGetGroupedUnpaidStudies = () => {
  const { requestFn } = useApi<GetGroupedUnpaidStudiesResponse>({
    url: "/listPayouts",
    method: "GET",
  });

  return useQuery({
    queryKey: ["listPayouts"],
    queryFn: ({ queryKey: [, data] }) => requestFn(data),
  });
};
