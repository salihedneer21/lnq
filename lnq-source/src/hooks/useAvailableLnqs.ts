import { useState, useEffect } from "react";
import { useGetAvailableLnqsToRespondTo } from "../api/CodeYellowApi";
import { useUpdateCYAvailability } from "../api/CodeYellowAvailabilityApi";
import { useUserData } from "../api/UserApi";
import { CodeYellowResponse } from "~/types/CodeYellowResponse";

export const useAvailableLnqs = () => {
  const { data: user } = useUserData();
  const { data: availableLnqsData, refetch } = useGetAvailableLnqsToRespondTo(1, 10);

  const availableLnqs = availableLnqsData?.docs ?? [];
  const [isLnqConfirmationModalVisible, setIsLnqConfirmationModalVisible] = useState(false);
  const [currentLnq, setCurrentLnq] = useState<CodeYellowResponse | null>(null);
  const [pendingLnqs, setPendingLnqs] = useState<CodeYellowResponse[]>([]);

  const updateAvailabilityMutation = useUpdateCYAvailability();

  const updateAvailableLnqs = () => {
    if (availableLnqs.length > 0 && !currentLnq && pendingLnqs.length === 0) {
      setPendingLnqs(availableLnqs);
      setCurrentLnq(availableLnqs[0]);
      setIsLnqConfirmationModalVisible(true);
    } else if (availableLnqs.length === 0) {
      setIsLnqConfirmationModalVisible(false);
      setCurrentLnq(null);
      setPendingLnqs([]);
    }
  };

  const handleLnqConfirmation = async (available: boolean) => {
    if (!currentLnq || !user?.id) return;

    setIsLnqConfirmationModalVisible(false);

    try {
      await updateAvailabilityMutation.mutateAsync({
        codeYellowId: currentLnq.id,
        optIn: available,
        userId: user.id,
      });

      setPendingLnqs((prev) => prev.slice(1));
      setCurrentLnq(null);

      setTimeout(() => {
        setPendingLnqs((prev) => {
          if (prev.length > 0) {
            setCurrentLnq(prev[0]);
            setIsLnqConfirmationModalVisible(true);
          }
          return prev;
        });
      }, 1000);

      refetch();
    } catch (error) {
      console.error("Error updating availability:", error);
      setIsLnqConfirmationModalVisible(true);
    }
  };

  const resetAllLnqs = () => {
    setIsLnqConfirmationModalVisible(false);
    setCurrentLnq(null);
    setPendingLnqs([]);
    updateAvailableLnqs();
  };

  useEffect(() => {
    updateAvailableLnqs();
  }, [availableLnqs, user?.id]);

  return {
    currentLnq,
    isLnqConfirmationModalVisible,
    setLnqConfirmationModalVisible: setIsLnqConfirmationModalVisible,
    handleLnqConfirmation,
    resetAllLnqs,
    updateAvailableLnqs,
  };
};
