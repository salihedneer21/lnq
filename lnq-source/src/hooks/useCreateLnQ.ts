import { useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import {
  useActivateCodeYellow,
  useActivateRepeatingCodeYellow,
} from "../api/CodeYellowApi";
import {
  createLnQWithAutoDetection,
  LnQCreateParams,
  LnQCreateCallbacks,
} from "../utils/lnqUtils";

export const useCreateLnQ = () => {
  const toast = useToast();
  const { mutate: activateCodeYellow } = useActivateCodeYellow();
  const { mutate: activateRepeatingCodeYellow } = useActivateRepeatingCodeYellow();

  const createLnQ = useCallback(
    (params: LnQCreateParams, callbacks?: LnQCreateCallbacks) => {
      createLnQWithAutoDetection(
        params,
        callbacks ?? {},
        activateCodeYellow,
        activateRepeatingCodeYellow,
        toast,
      );
    },
    [activateCodeYellow, activateRepeatingCodeYellow, toast],
  );

  return { createLnQ };
};
