import { CurrentUser } from "../types/CurrentUser";
import { useSignOut } from "./AuthApi";
import useApi from "./hooks/useApi";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUpdateUser = () => {
  const { requestFn } = useApi({
    url: "/user",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: Omit<CurrentUser, "email" | "id">) => requestFn(data),
  });
};

export const useUserData = () => {
  const { requestFn } = useApi<CurrentUser>({
    url: "/user",
    method: "GET",
  });

  return useQuery({
    queryKey: ["user"],
    queryFn: () => requestFn(),
    staleTime: Infinity,
    refetchOnMount: "always",
  });
};

export const useChangePassword = () => {
  const { requestFn } = useApi({
    url: "/user/changePassword",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => requestFn(data),
  });
};

export const useSyncCometChatFriends = () => {
  const { requestFn } = useApi({ url: "/user/sync-friends", method: "POST" });

  return useMutation({ mutationFn: () => requestFn() });
};

export const useDeleteAccount = () => {
  const { requestFn } = useApi({ url: "/user/disable", method: "POST" });
  const { mutate: signOut } = useSignOut();

  return useMutation({ mutationFn: () => requestFn(), onSuccess: () => signOut() });
};
