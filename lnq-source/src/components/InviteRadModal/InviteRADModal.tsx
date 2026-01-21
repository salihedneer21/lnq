import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { THEME_COLORS } from "../../base/theme/foundations/colors";

interface InviteRADModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    firstName: string;
    lastName: string;
    email: string;
    npi: string;
  }) => Promise<void>;
}

export const InviteRADModal: React.FC<InviteRADModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    npi: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      npi: "",
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormComplete = useCallback(() => {
    return Object.values(formData).every((value) => value.trim() !== "");
  }, [formData]);

  const handleSubmit = async () => {
    if (isFormComplete()) {
      setIsSubmitting(true);
      try {
        await onConfirm(formData);
      } catch (error) {
        console.error("Error inviting provider:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent bg="darkBlue2.900" color="white" p="60px" minW="500px" minH="660px">
        <ModalHeader>
          <Box textAlign="center">
            <Text fontSize="xl" fontWeight="bold" color="white">
              Invite RAD
            </Text>
          </Box>
          <Text fontSize="16px" fontWeight="700" mt={4} color="#8E959E">
            Please fill in all input fields
          </Text>
        </ModalHeader>
        <ModalBody>
          <VStack spacing={8}>
            <FormControl variant="floating">
              <Input
                name="firstName"
                placeholder=""
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="off"
              />
              <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                First Name
              </FormLabel>
            </FormControl>
            <FormControl variant="floating">
              <Input
                name="lastName"
                placeholder=""
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="off"
              />
              <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                Last Name
              </FormLabel>
            </FormControl>
            <FormControl variant="floating">
              <Input
                name="email"
                placeholder=""
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
              />
              <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                Email
              </FormLabel>
            </FormControl>
            <FormControl variant="floating">
              <Input
                name="npi"
                placeholder=""
                value={formData.npi}
                onChange={handleChange}
                autoComplete="off"
              />
              <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                NPI
              </FormLabel>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter display="flex" flexDirection="row" justifyContent="space-between">
          <Button variant="outline" mr={3} onClick={handleClose} width="100%">
            Cancel
          </Button>
          <Button
            colorScheme={isFormComplete() ? "brandYellow" : "gray"}
            color={isFormComplete() ? THEME_COLORS.brandBlue[800] : "gray.500"}
            bg={isFormComplete() ? "brandYellow.500" : "gray.300"}
            fontWeight="700"
            onClick={() => {
              handleSubmit();
            }}
            width="100%"
            isDisabled={!isFormComplete() || isSubmitting}
            isLoading={isSubmitting}
            _hover={{
              bg: isFormComplete() ? "brandYellow.600" : "gray.300",
              color: isFormComplete() ? THEME_COLORS.brandBlue[800] : "gray.500",
            }}
            _active={{
              bg: isFormComplete() ? "brandYellow.700" : "gray.300",
            }}
            _disabled={{
              opacity: 0.6,
              cursor: "not-allowed",
            }}
          >
            Invite
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
