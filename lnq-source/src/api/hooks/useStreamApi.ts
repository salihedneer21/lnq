import { useCallback } from "react";
import { AxiosRequestConfig } from "axios";
import { AxiosInstance } from "../_AxiosInstance";

interface UseStreamApiConfig<Data = unknown> extends Omit<AxiosRequestConfig, "data"> {
  data?: Data;
}

interface UseStreamApiOutput<RequestData = unknown> {
  streamFn: (data?: RequestData) => Promise<ArrayBuffer>;
}

const useStreamApi = <RequestData = unknown>(
  config: UseStreamApiConfig<RequestData>,
): UseStreamApiOutput<RequestData> => {
  const streamFn = useCallback(
    (requestData: RequestData = config.data as RequestData) => {
      const params = config.method === "GET" ? requestData : null;
      const data = config.method === "GET" ? null : requestData;

      return AxiosInstance.request<ArrayBuffer>({
        ...config,
        data,
        params,
        responseType: "arraybuffer",
      }).then((res) => res.data);
    },
    [config],
  );

  return { streamFn };
};

export default useStreamApi;
