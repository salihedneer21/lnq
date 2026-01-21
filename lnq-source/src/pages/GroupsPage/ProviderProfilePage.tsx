import { Box, Text, Button, useToast, Flex } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProviderProfileForm, {
  ProviderProfileFormRef,
} from "./components/ProviderProfileForm";
import { useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProviderProfile } from "../../types/CurrentUser";
import {
  useGetProviderProfile,
  useUpdateProvider,
  useCheckProviderProfileAccess,
} from "../../api/GroupProviderApi";
import ProviderProfileView from "./components/ProviderProfileView";
import ProviderStatusPanel, {
  ProviderStatusPanelRef,
} from "./components/ProviderStatusPanel";
import {
  useGetGroup,
  useGetProvidersInGroup,
  useSetGroupProviderRole,
  useSetGroupRVUTackerOptIn,
  useSetGroupProviderTargetingEnabled,
  useSetGroupProviderLnqEnabled,
  useSetGroupRVUTrackerVisibility,
  useSetGroupProviderFixedUsdPerRvu,
  useSetGroupProviderPayoutEnabled,
} from "../../api/GroupApi";
import { isValidUUID } from "../../utils/validation";

interface MutationOptions {
  onSuccess?: () => void;
  onError?: () => void;
}
interface BaseParams {
  groupId: string;
  groupProviderId: string;
}

interface StatusMutations {
  setGroupProviderRole: {
    mutate: (
      params: BaseParams & { role: "admin" | "member" },
      options: MutationOptions,
    ) => void;
  };
  setGroupRVUTrackerVisibility: {
    mutate: (
      params: BaseParams & { visibility: "view_all" | "view_self" | "none" },
      options: MutationOptions,
    ) => void;
  };
  setGroupProviderFixedUsdPerRvu: {
    mutate: (
      params: BaseParams & { fixedUsdPerRvu: number; fixedUsdPerRvuEnabled: boolean },
      options: MutationOptions,
    ) => void;
  };
  setGroupProviderPayoutEnabled: {
    mutate: (
      params: BaseParams & { payoutEnabled: boolean },
      options: MutationOptions,
    ) => void;
  };
  setGroupRVUTackerOptIn: {
    mutate: (
      params: BaseParams & { rvuTrackerOptIn: boolean },
      options: MutationOptions,
    ) => void;
  };
  setGroupProviderTargetingEnabled: {
    mutate: (
      params: BaseParams & { targetingEnabled: boolean },
      options: MutationOptions,
    ) => void;
  };
  setGroupProviderLnqEnabled: {
    mutate: (
      params: BaseParams & { lnqEnabled: boolean },
      options: MutationOptions,
    ) => void;
  };
}

const ProviderProfilePage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Refs
  const formRef = useRef<ProviderProfileFormRef>(null);
  const statusPanelRef = useRef<ProviderStatusPanelRef>(null);

  // Validate providerId
  const isValidProviderId = providerId && isValidUUID(providerId);

  // Data fetching hooks
  const {
    data: providerProfile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProviderProfile(providerId ?? undefined);

  const { data: accessData, isLoading: isAccessLoading } = useCheckProviderProfileAccess(
    providerId ?? undefined,
  );

  const { data: groupData, isLoading: isGroupLoading } = useGetGroup(accessData?.groupId);

  const {
    data: groupProvidersData,
    isLoading: isGroupProvidersLoading,
    refetch: refetchGroupProviders,
  } = useGetProvidersInGroup(accessData?.groupId ?? undefined, 1, 0, {});

  // Status update mutations
  const mutations: StatusMutations = {
    setGroupProviderRole: useSetGroupProviderRole(),
    setGroupRVUTackerOptIn: useSetGroupRVUTackerOptIn(),
    setGroupProviderPayoutEnabled: useSetGroupProviderPayoutEnabled(),
    setGroupProviderTargetingEnabled: useSetGroupProviderTargetingEnabled(),
    setGroupProviderLnqEnabled: useSetGroupProviderLnqEnabled(),
    setGroupRVUTrackerVisibility: useSetGroupRVUTrackerVisibility(),
    setGroupProviderFixedUsdPerRvu: useSetGroupProviderFixedUsdPerRvu(),
  };

  const { mutate: updateProvider } = useUpdateProvider(providerId ?? undefined);

  const groupProvider = useMemo(() => {
    if (!groupProvidersData?.providers || !accessData?.providerUserId) return null;
    return groupProvidersData.providers.find(
      (gp) => gp.user.id === accessData.providerUserId,
    );
  }, [groupProvidersData?.providers, accessData?.providerUserId]);

  const isLoading =
    isProfileLoading ?? isAccessLoading ?? isGroupLoading ?? isGroupProvidersLoading;

  const handleProfileUpdate = (formData: unknown): Promise<boolean> => {
    return new Promise((resolve) => {
      updateProvider(formData as Partial<ProviderProfile>, {
        onSuccess: () => resolve(true),
        onError: (error) => {
          console.error("Update profile error:", error);
          toast({
            title: "Error",
            description: "Failed to update provider profile",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          resolve(false);
        },
      });
    });
  };

  const handleStatusUpdate = async (
    statusData: Record<string, any>,
    baseParams: BaseParams,
  ): Promise<boolean> => {
    let success = true;

    const executeMutation = (mutation: any, params: any): Promise<void> => {
      return new Promise<void>((resolve) => {
        (mutation as { mutate: (params: any, options: MutationOptions) => void }).mutate(
          params,
          {
            onSuccess: () => resolve(),
            onError: () => {
              success = false;
              resolve();
            },
          },
        );
      });
    };

    const createUpdatePromise = (key: string, value: any): Promise<void> => {
      const mutation = mutations[key as keyof StatusMutations];
      if (!mutation) {
        return Promise.resolve();
      }

      const params = { ...baseParams, ...(value as Record<string, unknown>) };
      return executeMutation(mutation, params);
    };

    const updatePromises = Object.entries(statusData).map(([key, value]) =>
      createUpdatePromise(key, value),
    );

    await Promise.all(updatePromises);
    return success;
  };

  const handleSave = async () => {
    const formData = formRef.current?.getFormData();
    const statusData = statusPanelRef.current?.getStatusData();
    let hasChanges = false;
    let success = true;

    if (formData) {
      hasChanges = true;
      success = await handleProfileUpdate(formData);
    }

    if (statusData && groupData?.group.id && groupProvider?.id) {
      const baseParams = {
        groupId: groupData.group.id,
        groupProviderId: groupProvider.id,
      };

      if (Object.keys(statusData).length > 0) {
        hasChanges = true;
        success = success && (await handleStatusUpdate(statusData, baseParams));
      }
    }

    if (hasChanges) {
      if (success) {
        toast({
          title: "Success",
          description: "Provider settings updated successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        refetchProfile();
        refetchGroupProviders();
      }
    } else {
      toast({
        title: "Info",
        description: "No changes to save",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    formRef.current?.resetForm();
    statusPanelRef.current?.resetStatus();
  };

  // Show error if providerId is invalid
  if (!isValidProviderId) {
    return (
      <Box p={8}>
        <Text color="white">Invalid provider ID</Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box p={8}>
        <Text color="white">Loading...</Text>
      </Box>
    );
  }

  if (!providerProfile) {
    return (
      <Box p={8}>
        <Text color="white">Provider not found</Text>
      </Box>
    );
  }

  if (accessData?.isAdmin && !accessData?.isOwnProfile) {
    if (!groupData?.group || !groupProvider) {
      return (
        <Box p={8}>
          <Text color="white">Unable to load group or provider data</Text>
        </Box>
      );
    }

    return (
      <Box display="flex" flexDirection="column" w="100%" minH="100vh" p={0}>
        <Flex
          alignItems="center"
          gap={2}
          px={8}
          pt={8}
          pb={2}
          cursor="pointer"
          w="fit-content"
          onClick={() => navigate("/groups")}
          _hover={{ textDecoration: "underline", color: "brandYellow.600" }}
          tabIndex={0}
          fontSize={12}
          aria-label="Back to My groups"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate("/groups");
          }}
        >
          <ArrowBackIcon color="white" boxSize={5} />
          <Text color="white" fontWeight={500} fontSize="lg">
            My groups
          </Text>
        </Flex>
        <Text fontSize="34px" fontWeight="bold" color="white" px={8} mb={8}>
          {providerProfile.firstName} {providerProfile.lastName}
        </Text>
        <Flex w="100%" alignItems="flex-start">
          <Box w="40%" px={8} py={4} display="flex" flexDirection="column" gap={2}>
            <Text fontSize="20px" color="white">
              Provider status
            </Text>
          </Box>
          <Box w="60%" p={4}>
            <ProviderStatusPanel ref={statusPanelRef} groupProvider={groupProvider} />
          </Box>
        </Flex>

        <Flex w="100%" alignItems="flex-start">
          <Box w="40%" px={8} display="flex" flexDirection="column" gap={4}>
            <Text fontSize="20px" fontWeight="bold" color="white">
              Provider details
            </Text>
          </Box>
          <Box w="60%" p={4}>
            <ProviderProfileView provider={providerProfile} />
          </Box>
        </Flex>

        <Flex w="100%" justifyContent="flex-end" gap={4} p={8} mt="auto">
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
            onClick={() => {
              void handleSave();
            }}
            _hover={{ bg: "brandYellow.600" }}
          >
            Save Changes
          </Button>
        </Flex>
      </Box>
    );
  }

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
          <ProviderProfileForm ref={formRef} provider={providerProfile} />
        </Box>
      </Box>
      <Box display="flex" w="100%" mt="auto" alignItems="flex-start" gap={4}>
        <Box w="40%" px={8} display="flex" flexDirection="column">
          <Text fontSize="34px" fontWeight="bold" color="white" mb={6}>
            Delete Account
          </Text>
        </Box>
        <Box w="60%" display="flex" alignItems="flex-start" justifyContent="flex-start">
          <Box
            backgroundColor="darkBlue2.900"
            borderRadius="16px"
            py="20px"
            px="26px"
            w="100%"
          >
            <Text color="white" fontSize="14px" py={4} fontWeight="bold">
              Deleting your account will permanently remove your data and cannot be undone.
            </Text>
            <Button variant="outline" color="#FE5F55">
              Delete Account
            </Button>
          </Box>
        </Box>
      </Box>
      <Box display="flex" w="100%" justifyContent="flex-end" gap={4} mt={8}>
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
          onClick={() => {
            handleSave();
          }}
          _hover={{ bg: "brandYellow.600" }}
        >
          Save changes
        </Button>
      </Box>
    </Box>
  );
};

export default ProviderProfilePage;
