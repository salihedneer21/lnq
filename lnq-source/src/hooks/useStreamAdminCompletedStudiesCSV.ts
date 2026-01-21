import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useToast } from "@chakra-ui/react";

import useStreamApi from "../api/hooks/useStreamApi";
import { AdminCompletedStudy, CompensationSource } from "../types/AdminCompletedStudy";
import { PaymentStatus } from "../types/PaymentStatus";
import { PaymentStatusReason } from "../types/PaymentStatusReason";
import { createCYString } from "../utils/createCYString";

dayjs.extend(utc);

const DOWNLOAD_PROGRESS_WEIGHT = 0.3; // 30% of progress for download
const PROCESSING_PROGRESS_WEIGHT = 0.7; // 70% of progress for processing

interface FilterParams {
  groupId: string;
  groupName: string;
  paymentStatus?: PaymentStatus | null;
  paymentStatusReason?: PaymentStatusReason | null;
  payableToReader?: "true" | "false" | null;
  associatedToUser?: "true" | "false";
  dateRange?: Date[];
  radiologistIds?: string;
  compensationSource?: CompensationSource | null;
}

export const useStreamAdminCompletedStudiesCSV = ({
  groupId,
  groupName,
  paymentStatus,
  paymentStatusReason,
  payableToReader,
  associatedToUser,
  dateRange,
  radiologistIds,
  compensationSource,
}: FilterParams) => {
  const selectedRadiologistIds = radiologistIds;
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const { streamFn } = useStreamApi({
    url: "/adminStudies",
    method: "GET",
  });

  const headers = useMemo(
    () => [
      "Facility Code",
      "Order Description",
      "Reading Provider",
      "Provider ID",
      "RVU",
      "Payable",
      "Rate/RVU",
      "Prevailing Dollars Payable",
      "Date Finalized",
      "Payment Status",
      "Status Reason",
      "Compensation Source",
      "Prevailing LnQ",
      "Active LnQs",
      "Facility",
      "Is Paid Over Target",
      "Is Radiologist On Shift",
      "In Credit Shift Window",
      "Shift Name",
      "RVU Target",
      "Shift Work Date",
      "Date Finalized Unix Timestamp",
      "Accession number",
      "Patient Status",
      "Study TAT - Signed report",
      "Study TAT - Study available",
      "Message datetime",
      "MSH Header datetime",
      "Study TAT - calculated",
    ],
    [],
  );

  const streamReport = useCallback(async () => {
    try {
      setIsStreaming(true);
      setProgress(0);

      // Start download phase - 30% of total progress
      setProgress(5); // Initial progress to show activity
      const buffer = await streamFn({
        perPage: 0,
        skip: 0,
        groupId,
        paymentStatus,
        paymentStatusReason,
        payableToReader,
        associatedToUser,
        dateRange,
        radiologistIds: selectedRadiologistIds,
        compensationSource,
      });
      setProgress(DOWNLOAD_PROGRESS_WEIGHT * 100); // Download complete

      // Convert ArrayBuffer to string and parse JSON
      const decoder = new TextDecoder();
      const text = decoder.decode(buffer);
      const studies = JSON.parse(text) as AdminCompletedStudy[];

      if (studies.length === 0) {
        toast({ description: "No records to export", status: "info" });
        setIsStreaming(false);
        setProgress(0);
        return;
      }

      let csvContent = headers.join(",") + "\n";

      // Process each study - 70% of total progress
      const batchSize = 50; // Process in batches for smoother UI updates
      for (let i = 0; i < studies.length; i += batchSize) {
        const batch = studies.slice(i, i + batchSize);
        for (const study of batch) {
          const highestPayingCY =
            study.prevailingCodeYellow ??
            (study.activeAlerts && study.activeAlerts.length > 0
              ? study.activeAlerts.reduce(
                  (max, cy) => (max.usdPerRvu * 1 > cy.usdPerRvu * 1 ? max : cy),
                  study.activeAlerts[0],
                )
              : null);
          const prevailingCYString = highestPayingCY
            ? createCYString(highestPayingCY, groupName)
            : "N/A";
          const reportCodes = `"${study.orderCode}"`;
          const cyString =
            study.activeAlerts && study.activeAlerts.length > 0
              ? study.activeAlerts.reduce(
                  (prev, cy, index, array) =>
                    `${prev}${createCYString(cy, groupName)}${
                      index === array.length - 1 ? "" : " | "
                    }`,
                  "",
                )
              : "N/A";
          const date = dayjs(study.dateFinalized).format("MM/DD/YYYY h:mma");
          const procedureType =
            study.orderDescription && study.orderDescription.length > 0
              ? `"${study.orderDescription}"`
              : "-";
          const paymentStatusReason =
            study.paymentStatusReason && study.paymentStatusReason.length > 0
              ? study.paymentStatusReason
              : "-";

          const row = [
            reportCodes,
            procedureType,
            study.readingProvider,
            study.radiologistId,
            study.rvu.toFixed(2),
            study.payable ? "Yes" : "No",
            study.prevailingUsdPerRvu?.toFixed(2),
            study.prevailingDollarsPayable?.toFixed(2),
            date,
            study.paymentStatus,
            paymentStatusReason,
            study.compensationSource ?? "N/A",
            prevailingCYString,
            cyString,
            study.originalFacility,
            study.paidOverTarget,
            study.isRadiologistOnShift,
            study.inCreditShiftWindow,
            study.shiftName,
            study.rvuTarget,
            study.shiftWorkDate,
            study.dateFinalizedUnixTimestamp,
            study.accessionNumber ?? "N/A",
            study.encounterClass ?? "N/A",
            study.signedReportDatetime
              ? dayjs(study.signedReportDatetime).format("MM/DD/YYYY h:mma")
              : "N/A",
            study.studyAvailableDatetime
              ? dayjs(study.studyAvailableDatetime).format("MM/DD/YYYY h:mma")
              : "N/A",
            study.msgReceivedDatetime
              ? dayjs(study.msgReceivedDatetime).format("MM/DD/YYYY h:mma")
              : "N/A",
            study.mshDatetime ? dayjs(study.mshDatetime).format("MM/DD/YYYY h:mma") : "N/A",
            study.studyTatMinutes ?? "N/A",
          ].join(",");

          csvContent += row + "\n";
        }
        // Update progress for processing phase
        const processingProgress = (i + batch.length) / studies.length;
        const totalProgress =
          (DOWNLOAD_PROGRESS_WEIGHT + PROCESSING_PROGRESS_WEIGHT * processingProgress) *
          100;
        setProgress(Math.round(totalProgress));

        // Allow UI to update by yielding to the event loop
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const title = `Admin Completed Studies Report ${new Date().toISOString()}`;
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
  }, [
    streamFn,
    groupId,
    paymentStatus,
    paymentStatusReason,
    payableToReader,
    associatedToUser,
    dateRange,
    selectedRadiologistIds,
    compensationSource,
    headers,
    toast,
    groupName,
  ]);

  return {
    streamReport,
    isStreaming,
    progress,
  };
};
