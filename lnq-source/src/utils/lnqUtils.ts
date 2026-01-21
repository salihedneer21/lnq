import { useToast } from "@chakra-ui/react";
import { RepetitionSettings } from "../types/Repetition";
import { Limits } from "../types/CodeYellow";

export interface LnQCreateParams {
  worklistId: string;
  distributionType: "open" | "target";
  usdPerRvu: number;
  userIDs?: string[];
  groupId?: string;
  dateRange?: { start: string; end?: string };
  limits?: Limits;
  repetitionEnabled?: boolean;
  repetitionSettings?: RepetitionSettings;
  lnqName?: string;
}

export interface LnQCreateCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

export const createLnQ = (
  params: LnQCreateParams,
  callbacks: LnQCreateCallbacks,
  activateCodeYellow: (data: any, options: any) => void,
  activateRepeatingCodeYellow: (data: any, options: any) => void,
  toast: ReturnType<typeof useToast>,
) => {
  const {
    worklistId,
    distributionType,
    usdPerRvu,
    userIDs,
    groupId,
    dateRange,
    limits,
    repetitionEnabled,
    repetitionSettings,
    lnqName,
  } = params;

  const { onSuccess, onError, onFinally } = callbacks;

  const isRepeating = repetitionEnabled && repetitionSettings;

  const baseData = {
    worklistId,
    distributionType,
    usdPerRvu,
    dateRange,
    userIds: userIDs,
    groupId,
    limits,
  };

  const commonCallbacks = {
    onSuccess: () => {
      const title = isRepeating ? "Repeating LnQ Created" : "LnQ Created";
      const description = isRepeating
        ? "The repeating LnQ has been successfully created."
        : "The LnQ has been successfully created.";

      toast({
        title,
        description,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onSuccess?.();
      onFinally?.();
    },
    onError: (error: Error) => {
      console.error(`Error creating ${isRepeating ? "repeating " : ""}LnQ:`, error);

      const title = `Error Creating ${isRepeating ? "Repeating " : ""}LnQ`;
      toast({
        title,
        description: error.message || "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      onError?.(error);
      onFinally?.();
    },
  };

  if (isRepeating) {
    const { id: _, ...repetitionSettingsWithoutId } = repetitionSettings;
    activateRepeatingCodeYellow(
      {
        ...baseData,
        repeat: repetitionSettingsWithoutId,
        name: lnqName && lnqName.trim() !== "" ? lnqName : undefined,
      },
      commonCallbacks,
    );
  } else {
    activateCodeYellow(baseData, commonCallbacks);
  }
};

export const createLnQWithAutoDetection = (
  params: LnQCreateParams,
  callbacks: LnQCreateCallbacks,
  activateCodeYellow: (data: any, options: any) => void,
  activateRepeatingCodeYellow: (data: any, options: any) => void,
  toast: ReturnType<typeof useToast>,
) => {
  return createLnQ(
    params,
    callbacks,
    activateCodeYellow,
    activateRepeatingCodeYellow,
    toast,
  );
};
