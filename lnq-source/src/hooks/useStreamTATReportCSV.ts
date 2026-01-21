import { useCallback, useState } from "react";
import { useToast } from "@chakra-ui/react";

import { CompensationSource } from "~types/AdminCompletedStudy";
import { PaymentStatus } from "~types/PaymentStatus";
import { PaymentStatusReason } from "~/types/PaymentStatusReason";

import { queryClient } from "../api/QueryClient";
import { EnvConfig } from "../base/EnvConfig";
import { getUserTimeZone } from "../utils/timeZones";

interface FilterParams {
  groupId: string;
  groupName: string;
  dateRange?: Date[];
  radiologistIds?: string;
  paymentStatus?: PaymentStatus;
  paymentStatusReason?: PaymentStatusReason;
  payableToReader?: "true" | "false";
  associatedToUser?: "true" | "false";
  compensationSource?: CompensationSource;
}

export const useStreamTATReportCSV = ({
  groupId,
  groupName,
  dateRange,
  radiologistIds,
  paymentStatus,
  paymentStatusReason,
  payableToReader,
  associatedToUser,
  compensationSource,
}: FilterParams) => {
  const selectedRadiologistIds = radiologistIds;
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const streamReport = useCallback(async () => {
    try {
      setIsStreaming(true);
      setProgress(0);

      const params = new URLSearchParams();
      params.append("groupId", groupId);

      const userTimezone = getUserTimeZone();
      params.append("timezone", userTimezone);

      if (dateRange && dateRange.length === 2) {
        for (const date of dateRange) {
          params.append("dateRange", date.toISOString());
        }
      }

      if (selectedRadiologistIds) {
        params.append("radiologistIds", selectedRadiologistIds);
      }

      if (paymentStatus) {
        params.append("paymentStatus", paymentStatus);
      }

      if (paymentStatusReason) {
        params.append("paymentStatusReason", paymentStatusReason);
      }

      if (payableToReader) {
        params.append("payableToReader", payableToReader);
      }

      if (associatedToUser) {
        params.append("associatedToUser", associatedToUser);
      }

      if (compensationSource) {
        params.append("compensationSource", compensationSource);
      }

      const accessToken = queryClient.getQueryData(["accessToken"]) as string | null;

      const backendUrl = EnvConfig.BACKEND_BASE_URL.endsWith("/")
        ? EnvConfig.BACKEND_BASE_URL.slice(0, -1)
        : EnvConfig.BACKEND_BASE_URL;

      const response = await fetch(`${backendUrl}/tatReport?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken ?? ""}`,
          // "x-user-timezone": userTimezone,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setProgress(50);

      const csvContent = await response.text();

      setProgress(75);

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const filename = `TAT_Report_${groupName}_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.setAttribute("href", url);
      a.setAttribute("download", filename);
      a.click();

      globalThis.URL.revokeObjectURL(url);
      setProgress(100);
      setIsStreaming(false);

      toast({
        description: "TAT Report exported successfully",
        status: "success",
      });
    } catch (error) {
      console.error("Error exporting TAT report:", error);
      toast({
        description: "Error exporting TAT report",
        status: "error",
      });
      setIsStreaming(false);
      setProgress(0);
    }
  }, [
    groupId,
    groupName,
    dateRange,
    selectedRadiologistIds,
    paymentStatus,
    paymentStatusReason,
    payableToReader,
    associatedToUser,
    compensationSource,
    toast,
  ]);

  return {
    streamReport,
    isStreaming,
    progress,
  };
};
