import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Query will be stored for one day max
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});
