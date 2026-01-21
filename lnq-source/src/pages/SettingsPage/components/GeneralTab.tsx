import { useRef, useMemo } from "react";
import { Button, Box, Text, useToast } from "@chakra-ui/react";
import { useDeleteAccount, useUpdateUser, useUserData } from "../../../api/UserApi";
import ProviderProfileForm, {
  ProviderProfileFormRef,
} from "../../GroupsPage/components/ProviderProfileForm";
import { useHandleModal } from "../../../hooks/useHandleModal";
import { CurrentUser, ProviderProfile } from "../../../types/CurrentUser";

const GeneralTab = () => {
  const { data: currentUser } = useUserData() as { data: CurrentUser | undefined };
  const userInterest = currentUser?.userInterest;
  const { mutate: deleteAccount } = useDeleteAccount();
  const handleModal = useHandleModal();
  const toast = useToast();
  const formRef = useRef<ProviderProfileFormRef>(null);

  const providerData = useMemo(
    () => ({
      id: currentUser?.id ?? "",
      firstName: currentUser?.firstName ?? "",
      lastName: currentUser?.lastName ?? "",
      email: currentUser?.email ?? "",
      address: currentUser?.address ?? "",
      phone: currentUser?.phone ?? "",
      providerId: currentUser?.providerId ?? "",
      subSpecialties: userInterest?.specialty
        ? userInterest.specialty.split(", ").filter(Boolean)
        : [],
      providerNotes: userInterest?.additionalInfo ?? "",
      workDays: userInterest?.availabilityPreferenceDays ?? [],
      workHours: userInterest?.availabilityPreferenceHours ?? [],
      workType: {
        weekdays: userInterest?.weekdays ?? true,
        weekends: userInterest?.weekends ?? false,
        swing: userInterest?.swingShifts ?? false,
        overnights: userInterest?.overnights ?? false,
        dedicated: userInterest?.dedicatedShifts ?? false,
      },
      rvus: userInterest?.rvuPerMonth
        ? userInterest.rvuPerMonth.split(", ").filter(Boolean)
        : [],
      stateLicenses: userInterest?.stateLicenses ?? [],
      malpractice: userInterest?.hasMalpracticeInsurance ?? false,
      credentialPacket: "",
    }),
    [currentUser, userInterest],
  );

  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const showDeletionModal = () => {
    handleModal({
      title: "Delete your account?",
      subtitle:
        "This action cannot be undone. Are you sure you want to delete your account?",
      variant: "destructive",
      leftButtonTitle: "Cancel",
      rightButtonTitle: "Delete Account",
      onClickRightButton: () => {
        deleteAccount();
      },
    });
  };

  const handleSave = () => {
    console.log("GeneralTab handleSave called");
    const formData = formRef.current?.getFormData() as ProviderProfile | undefined;
    console.log("GeneralTab handleSave - formData:", formData);
    if (!formData) return;

    const params = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      providerId: formData.providerId,
      address: formData.address,
      specialty: formData.subSpecialties?.join(", "),
      additionalInfo: formData.providerNotes,
      availabilityPreferences: {
        days: formData.workDays,
        hours: formData.workHours,
      },
      workTypes: {
        weekdays: formData.workType?.weekdays,
        weekends: formData.workType?.weekends,
        swingShifts: formData.workType?.swing,
        overnights: formData.workType?.overnights,
        dedicatedShifts: formData.workType?.dedicated,
      },
      rvuPerMonth: formData.rvus?.join(", "),
      stateLicenses: formData.stateLicenses,
      hasMalpracticeInsurance: formData.malpractice,
    };

    updateUser(params, {
      onSuccess: () => {
        console.log("GeneralTab handleSave - success");
        toast({
          title: "Success",
          description: "Profile updated successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (err: unknown) => {
        console.error("GeneralTab handleSave - error:", err);
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    });
  };

  const handleCancel = () => {
    formRef.current?.resetForm();
  };

  return (
    <Box display="flex" flexDirection="column" w="100%" minH="100vh">
      <Box display="flex" w="100%">
        <Box w="40%" pt={8} px={8} display="flex" flexDirection="column">
          <Text fontSize="34px" fontWeight="bold" color="white" mb={6}>
            General Information
          </Text>
          <Text fontSize="20px" color="white">
            Provider details
          </Text>
        </Box>
        <Box w="60%" p={4}>
          <ProviderProfileForm ref={formRef} provider={providerData} />
        </Box>
      </Box>

      <Box display="flex" w="100%" justifyContent="flex-end" gap={4} p={6}>
        <Button
          variant="outline"
          colorScheme="white"
          textColor="white"
          _hover={{ bg: "whiteAlpha.200" }}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          colorScheme="brandYellow"
          textColor="brandBlue.800"
          onClick={() => handleSave()}
          _hover={{ bg: "brandYellow.600" }}
          isDisabled={isUpdating}
          isLoading={isUpdating}
        >
          Save changes
        </Button>
      </Box>

      <Box display="flex" w="100%" mt="auto" alignItems="flex-start" gap={4}>
        <Box w="40%" px={8} display="flex" flexDirection="column">
          <Text fontSize="34px" fontWeight="bold" color="white" mb={6}>
            Delete Account
          </Text>
        </Box>
        <Box
          w="60%"
          p={4}
          display="flex"
          alignItems="flex-start"
          justifyContent="flex-start"
        >
          <Box
            backgroundColor="darkBlue2.900"
            borderRadius="16px"
            py="20px"
            px="24px"
            w="100%"
          >
            <Text color="white" fontSize="14px" py={4} fontWeight="bold">
              Deleting your account will permanently remove your data and cannot be undone.
            </Text>
            <Button variant="outline" color="#FE5F55" onClick={() => showDeletionModal()}>
              Delete Account
            </Button>
          </Box>
        </Box>
      </Box>

      <Box display="flex" w="100%" justifyContent="flex-end" mt={6} px={8}>
        <Text color="white" fontSize="sm">
          Version 1.5.0
        </Text>
      </Box>
    </Box>
  );
};

export default GeneralTab;
