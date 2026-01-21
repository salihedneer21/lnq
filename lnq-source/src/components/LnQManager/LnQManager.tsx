import React from "react";
import { Box } from "@chakra-ui/react";
import { useAvailableLnqs } from "../../hooks/useAvailableLnqs";
import { LnQConfirmationModal } from "../LnQ/LnQConfirmationModal";

const LnQManager: React.FC = () => {
  const { currentLnq, isLnqConfirmationModalVisible, handleLnqConfirmation } =
    useAvailableLnqs();

  return (
    <Box>
      <LnQConfirmationModal
        lnq={currentLnq}
        isOpen={isLnqConfirmationModalVisible}
        onConfirm={() => {
          handleLnqConfirmation(true);
        }}
        onDecline={() => {
          handleLnqConfirmation(false);
        }}
      />
    </Box>
  );
};

export default LnQManager;
