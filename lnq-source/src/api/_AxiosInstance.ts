import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { EnvConfig } from "../base/EnvConfig";
import { queryClient } from "./QueryClient";
import { getUserTimeZone } from "../utils/timeZones";

// Base Axios Instance
export const AxiosInstance = axios.create({
  baseURL: EnvConfig.BACKEND_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Initialize and Refresh Bearer Token
AxiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Add the authentication token to the request headers for each request
  const accessToken = queryClient.getQueryData(["accessToken"]) as string | null;
  if (!config.headers.Authorization) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // if (!config.headers["x-user-timezone"]) {
  //   config.headers.set("x-user-timezone", getUserTimeZone());
  // }

  return config;
});

// Error handler
AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const statusCode = error.response?.status;
    const accessToken = queryClient.getQueryData(["accessToken"]) as string | null;
    if (statusCode && statusCode === 401 && accessToken) {
      await queryClient.setQueryData(["accessToken"], null);
      await queryClient.invalidateQueries({ queryKey: ["accessToken"] });
      queryClient.clear();
      return;
    }
    interface ErrorResponse {
      message?: string;
      error?: string;
      // add other properties if needed
    }

    // Then use it like this:
    const errorMessage: string =
      (error.response?.data as ErrorResponse)?.message ??
      (error.response?.data as ErrorResponse)?.error ??
      error.message ??
      "Something went wrong. Please try again later!";

    // Don't show this error
    if (errorMessage.includes("Request failed with status code 401")) {
      return;
    }
    // toastID prevents repeated errors from showing
    const toastId = `id:${errorMessage}`;
    if (!window.toast.isActive(toastId))
      window.toast({
        id: toastId,
        description: errorMessage,
        status: "error",
        position: "top",
        isClosable: true,
        duration: 5000,
      });

    throw error;
  },
);
