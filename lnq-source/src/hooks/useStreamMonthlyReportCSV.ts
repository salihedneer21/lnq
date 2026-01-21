import { useToast } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import useStreamApi from "../api/hooks/useStreamApi";
import { CodeYellowGroup, GroupMonthlyReport } from "../types/MonthlyReport";

const DOWNLOAD_PROGRESS_WEIGHT = 0.3; // 30% of progress for download
const PROCESSING_PROGRESS_WEIGHT = 0.7; // 70% of progress for processing

interface StreamMonthlyReportParams {
  groupId: string;
  month: string;
  utcOffset: number; // User's UTC offset in minutes
}

interface MonthlyReportRequest {
  month: string;
  utcOffset: number;
  page: number;
  perPage: number;
  stream: boolean;
}

export const useStreamMonthlyReportCSV = ({
  groupId,
  month,
  utcOffset,
}: StreamMonthlyReportParams) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const { streamFn } = useStreamApi<MonthlyReportRequest>({
    url: `/group/${groupId}/monthly-report`,
    method: "GET",
  });

  const getTypeLabel = (group: CodeYellowGroup): string => {
    if (group.compensationSource === "SCHEDULE") {
      return group.shiftName;
    }
    return group.type === "Group" ? "Group LnQ" : "Individual LnQ";
  };

  const getActivatedBy = (group: CodeYellowGroup): string => {
    if (group.compensationSource === "SCHEDULE") return "-";
    return group.activatedBy;
  };

  const getShift = (group: CodeYellowGroup): string => group.displayLabel;

  const streamReport = useCallback(async () => {
    try {
      setIsStreaming(true);
      setProgress(0);

      // Start download phase - 30% of progress
      setProgress(5); // Initial progress to show activity
      const buffer = await streamFn({
        month,
        utcOffset,
        page: 1,
        perPage: 0, // Get all records
        stream: true,
      });
      setProgress(DOWNLOAD_PROGRESS_WEIGHT * 100); // Download complete

      // Convert ArrayBuffer to string and parse JSON
      const decoder = new TextDecoder();
      const text = decoder.decode(buffer);
      const data = JSON.parse(text) as GroupMonthlyReport;

      if (!data.providers || data.providers.length === 0) {
        toast({ description: "No records to export", status: "info" });
        setIsStreaming(false);
        setProgress(0);
        return;
      }

      const headers = [
        "Radiologist Name",
        "Shift",
        "Type",
        "Activated by",
        "Total Payable RVUs",
        "Total Payment",
      ];

      let csvContent = headers.join(",") + "\n";

      // Process each provider and their code yellow groups
      const totalItems = data.providers.reduce(
        (acc, provider) => acc + provider.codeYellowGroups.length,
        0,
      );
      let processedItems = 0;

      for (const provider of data.providers) {
        for (const group of provider.codeYellowGroups) {
          const typeLabel = getTypeLabel(group);
          const activatedByDisplay = getActivatedBy(group);

          const row = [
            `${provider.providerName}`,
            `${getShift(group)}`,
            `${typeLabel}`,
            `${activatedByDisplay}`,
            group.totalRvus.toFixed(2),
            group.totalPayment.toFixed(2),
          ].join(",");

          csvContent += row + "\n";

          // Update progress for processing phase
          processedItems++;
          const processingProgress = processedItems / totalItems;
          const totalProgress =
            (DOWNLOAD_PROGRESS_WEIGHT + PROCESSING_PROGRESS_WEIGHT * processingProgress) *
            100;
          setProgress(Math.round(totalProgress));

          // Allow UI to update by yielding to the event loop
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const title = `Monthly Report ${month}`;
      a.setAttribute("href", url);
      a.setAttribute("download", `${title}.csv`);
      a.click();

      globalThis.URL.revokeObjectURL(url);
      setProgress(100); // Complete
      setIsStreaming(false);
      toast({ description: "Report generated successfully", status: "success" });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({ description: "Error generating report", status: "error" });
      setIsStreaming(false);
      setProgress(0);
    }
  }, [month, utcOffset, streamFn, toast]);

  return {
    streamReport,
    isStreaming,
    progress,
  };
};
