import { useToast } from "@chakra-ui/react";

import { CompensationSource } from "~/types/AdminCompletedStudy";
import { PaymentStatus } from "~/types/PaymentStatus";
import { PaymentStatusReason } from "~/types/PaymentStatusReason";

export function handlePaymentStatusError(
  toast: ReturnType<typeof useToast>,
  error: unknown,
) {
  console.error("Failed to update payment status:", error);
  toast({
    title: "Error",
    description: "Failed to update payment status. Please try again.",
    status: "error",
    duration: 5000,
    isClosable: true,
  });
}

export function handlePaymentStatusSuccess(
  toast: ReturnType<typeof useToast>,
  type: "bulk" | "individual",
  description?: string,
) {
  toast({
    title: "Success",
    description:
      type === "bulk"
        ? description ?? "Studies have been marked as paid successfully."
        : "Study has been marked as paid successfully.",
    status: "success",
    duration: 10000,
    isClosable: true,
  });
}

export function getPayableToReaderFilterOptions(paymentStatusFilter: string | null) {
  if (!paymentStatusFilter) {
    return ["true", "false"];
  } else if (paymentStatusFilter === "NONPAYABLE") {
    return ["false"];
  } else {
    return ["true"];
  }
}

export function getPaymentStatusFilterOptions(payableToReaderFilter: string | null) {
  if (!payableToReaderFilter) {
    return ["PENDING", "PAYABLE", "PAID", "NONPAYABLE"];
  } else if (payableToReaderFilter === "true") {
    return ["PENDING", "PAYABLE", "PAID"];
  } else {
    return ["NONPAYABLE"];
  }
}

export function getCompensationSourceFilterOptions() {
  return ["LNQ", "SCHEDULE"];
}

export function getSchedulePayableReasonFilterOptions() {
  return ["ON_SCHEDULE_PAYABLE_ON_SHIFT", "ON_SCHEDULE_PAYABLE_OVER_TARGET"];
}

export function buildReportParams({
  groupId,
  groupName,
  dateRange,
  radiologistIds,
  paymentStatusFilter,
  paymentStatusReason,
  payableToReaderFilter,
  associatedToUserFilter,
  compensationSourceFilter,
}: {
  groupId: string;
  groupName: string;
  dateRange?: Date[];
  radiologistIds?: string;
  paymentStatusFilter?: PaymentStatus | null;
  paymentStatusReason?: PaymentStatusReason | null;
  payableToReaderFilter?: "true" | "false" | null;
  associatedToUserFilter?: "true" | "false" | null;
  compensationSourceFilter?: CompensationSource | null;
}) {
  return {
    groupId,
    groupName,
    ...(dateRange && { dateRange }),
    ...(radiologistIds && { radiologistIds }),
    ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
    ...(paymentStatusReason && { paymentStatusReason }),
    ...(payableToReaderFilter && { payableToReader: payableToReaderFilter }),
    ...(associatedToUserFilter && { associatedToUser: associatedToUserFilter }),
    ...(compensationSourceFilter && { compensationSource: compensationSourceFilter }),
  };
}
