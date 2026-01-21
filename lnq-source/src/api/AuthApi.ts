import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountStatus, AuthUser, CurrentUser } from "../types/CurrentUser";
import useApi from "./hooks/useApi";

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.setQueryData(["accessToken"], null);
    },
    onSuccess: async () => {
      queryClient.clear();
      return queryClient.invalidateQueries({ queryKey: ["accessToken"] });
    },
  });
};

export const useSetAccessTokenFromAuthUser = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useGetAuthUser();
  return useMutation({
    mutationFn: async () => {
      if (!authUser) {
        throw new Error("Auth user is undefined");
      }
      await queryClient.setQueryData(["accessToken"], authUser.accessToken);
      await queryClient.invalidateQueries({ queryKey: ["accessToken"] });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["authUser"] });
    },
  });
};

export const useGetAuthUser = () => {
  const queryClient = useQueryClient();
  return useQuery({
    staleTime: Infinity,
    queryKey: ["authUser"],
    queryFn: () => {
      const authUser = queryClient.getQueryData(["authUser"]) as AuthUser | null;
      return authUser
        ? Promise.resolve(authUser)
        : Promise.reject(new Error("No auth user"));
    },
  });
};

export const useSetAuthUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AuthUser) => {
      await queryClient.setQueryData(["authUser"], data, { updatedAt: Date.now() });
    },
  });
};

export const useAccessToken = () => {
  const queryClient = useQueryClient();
  return useQuery({
    staleTime: Infinity,
    queryKey: ["accessToken"],
    queryFn: () => {
      const token = queryClient.getQueryData(["accessToken"]) as string | null;
      return token ? Promise.resolve(token) : Promise.resolve("");
    },
  });
};

export const useUserRegistration = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    jwt: {
      accessToken: string;
    };
    user: AuthUser;
  }>({
    url: "/auth/register",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      email: string;
      providerId: string;
      phone: string;
      password?: string;
      specialty?: string;
      additionalInfo?: string;
      availabilityPreferences?: {
        days: string[];
        hours: string[];
      };
      workTypes?: {
        weekdays: boolean;
        weekends: boolean;
        swingShifts: boolean;
        overnights: boolean;
        dedicatedShifts: boolean;
      };
      rvuPerMonth?: string;
      stateLicenses?: string[];
      hasMalpracticeInsurance?: boolean;
    }) => requestFn(data),
    onSuccess: async (data) => {
      return Promise.all([
        queryClient.setQueryData(["accessToken"], data.jwt.accessToken),
        queryClient.invalidateQueries({ queryKey: ["accessToken"] }),
        queryClient.invalidateQueries({ queryKey: ["user"] }),
      ]);
    },
  });
};

interface TempPasswordUser {
  email: string;
  accessToken: string;
}

export const useUserLogin = () => {
  const queryClient = useQueryClient();
  const { requestFn } = useApi<{
    message: string;
    jwt: {
      accessToken: string;
    };
    user: CurrentUser;
  }>({
    url: "/auth/login",
    method: "POST",
  });
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => requestFn(data),
    onSuccess: async (data) => {
      if (
        data.user.accountStatus === AccountStatus.TEMPORARY_PASSWORD ||
        data.user.accountStatus === AccountStatus.PENDING_FIRST_LOGIN
      ) {
        const tempUserData: TempPasswordUser = {
          email: data.user.email,
          accessToken: data.jwt.accessToken,
        };
        queryClient.setQueryData<TempPasswordUser>(["tempPasswordUser"], tempUserData);
        return;
      }

      if (
        data.user.mfaEnabled === true ||
        data.user.accountStatus === AccountStatus.NEEDS_VERIFICATION
      ) {
        await queryClient.setQueryData(["authUser"], {
          accessToken: data.jwt.accessToken,
        });
        return;
      }
      await queryClient.setQueryData(["accessToken"], data.jwt.accessToken);
      await queryClient.invalidateQueries({ queryKey: ["accessToken"] });
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useCheckEmail = () => {
  const { requestFn } = useApi<{ message: string }>({
    url: "/auth/checkEmail",
    method: "POST",
  });

  return useMutation({ mutationFn: (email: string) => requestFn({ email }) });
};

export const useVerifyEmail = () => {
  const { requestFn } = useApi<{
    message: string;
  }>({
    url: "/auth/verifyEmail",
    method: "POST",
  });

  return useMutation({ mutationFn: (email: string) => requestFn({ email }) });
};

export const useVerifyEmailCode = () => {
  const { requestFn } = useApi<{
    message: string;
  }>({
    url: "/auth/verifyEmailCode",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: { email: string; code: string }) => requestFn(data),
  });
};

export const useVerifyPhone = () => {
  const { requestFn } = useApi<{
    message: string;
  }>({
    url: "/auth/verifyPhone",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: { phone: string; email: string }) => requestFn(data),
  });
};

export const useVerifyPhoneCode = () => {
  const { requestFn } = useApi<{
    message: string;
  }>({
    url: "/auth/verifyPhoneCode",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: { phone: string; email: string; code: string }) => requestFn(data),
  });
};

export const useVerifyForgotPasswordCode = () => {
  const { requestFn } = useApi<{
    message: string;
  }>({
    url: "/auth/verifyForgotPasswordCode",
    method: "POST",
  });

  interface Props {
    email: string | undefined | null;
    password: string | undefined | null;
    code: string | null;
  }

  return useMutation({ mutationFn: (data: Props) => requestFn(data) });
};

export const useForgotPassword = () => {
  const { requestFn } = useApi({
    url: "/auth/forgotPassword",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: { email: string; password: string; code: string }) =>
      requestFn(data),
  });
};

export const useChangeTemporaryPassword = () => {
  const { requestFn } = useApi<{
    message: string;
  }>({
    url: "/auth/changeTemporaryPassword",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: { email: string; currentPassword: string; newPassword: string }) =>
      requestFn(data),
  });
};

export const AuthAPI = {
  register: useUserRegistration,
  login: useUserLogin,
};
