import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  useClipboard,
} from "@chakra-ui/react";
import { THEME_COLORS } from "../../base/theme/foundations/colors";

interface TemporaryPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  temporaryPassword: string;
  isReset: boolean;
}

const TemporaryPasswordModal: React.FC<TemporaryPasswordModalProps> = ({
  isOpen,
  onClose,
  temporaryPassword,
  isReset,
}) => {
  const { hasCopied, onCopy } = useClipboard(temporaryPassword);

  const headerText = isReset ? "Reset Password" : "Temporary Password";
  const bodyText = isReset
    ? "Here is the user's reset password. They will be prompted to create a new password upon their next login."
    : "Here is the user's temporary password. They will be prompted to create a new password upon their first login.";
  const buttonColor = isReset ? THEME_COLORS.brandBlue[800] : "darkBlue.900";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="darkBlue2.900" color="white" p="40px" minW="400px">
        <ModalHeader textAlign="center">
          <Text fontSize="24px" fontWeight="bold" color="white">
            {headerText}
          </Text>
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontSize="14px" textAlign="start" color="grey">
              {bodyText}
            </Text>
            <Text fontSize="24px" fontWeight="bold" textAlign="center" my={4} color="white">
              {temporaryPassword}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="yellow"
            color={buttonColor}
            fontWeight="700"
            width="100%"
            onClick={onCopy}
          >
            {hasCopied ? "Copied!" : `Copy ${isReset ? "Reset" : "Temporary"} Password`}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TemporaryPasswordModal;
