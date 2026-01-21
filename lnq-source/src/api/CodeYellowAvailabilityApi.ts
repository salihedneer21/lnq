import { useMutation, useQueryClient } from "@tanstack/react-query";
import useApi from "./hooks/useApi";

export const useUpdateCYAvailability = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    availability: boolean;
  }>({
    url: "/codeYellowAvailability/update",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: {
      codeYellowId: string;
      userId: string;
      optIn: boolean;
      resetUserResponded?: boolean;
    }) => requestFn(data),
    onSuccess: (_, { codeYellowId }) => {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["codeYellowTargetedProvidersWithAvailability", codeYellowId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["codeYellow", codeYellowId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myActiveTargetedCodeYellows"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myScheduledTargetedCodeYellows"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myActiveCodeYellows"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["myScheduledCodeYellows"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["groupedActiveAndScheduledCodeYellows"],
        }),
      ]);
    },
  });
};
