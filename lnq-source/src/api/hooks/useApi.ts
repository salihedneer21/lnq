import { useCallback } from "react";
import { AxiosRequestConfig } from "axios";
import { AxiosInstance } from "../_AxiosInstance";

interface UseApiConfig<Data = unknown> extends Omit<AxiosRequestConfig, "data"> {
  data?: Data;
  fetchOnMount?: boolean;
}

interface UseApiOutput<ResponseData, RequestData = unknown> {
  requestFn: (
    data?: RequestData & { params?: Record<string, string> },
  ) => Promise<ResponseData>;
}

const useApi = <ResponseData, RequestData = unknown>(
  config: UseApiConfig<RequestData>,
): UseApiOutput<ResponseData, RequestData> => {
  const requestFn = useCallback(
    async (requestData?: RequestData & { params?: Record<string, string> }) => {
      const rawRequestData = (requestData ??
        (config.data as RequestData)) as RequestData & { params?: Record<string, string> };

      let url = config.url ?? "";
      let cleanedData = rawRequestData as RequestData;

      if (rawRequestData && typeof rawRequestData === "object" && rawRequestData.params) {
        for (const [key, value] of Object.entries(rawRequestData.params)) {
          url = url.replace(`:${key}`, value);
        }

        const { params: _params, ...rest } = rawRequestData;
        cleanedData = rest as RequestData;
      }

      const isGet = config.method === "GET";

      return AxiosInstance.request<ResponseData>({
        ...config,
        url,
        data: isGet ? null : cleanedData,
        params: isGet ? cleanedData : null,
        headers:
          cleanedData instanceof FormData ? { "Content-Type": undefined } : config.headers,
      }).then((res) => res.data);
    },
    [config],
  );

  return { requestFn };
};

export default useApi;
