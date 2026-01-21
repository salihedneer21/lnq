import React, { useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import {
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
} from "@chakra-ui/react";

import { useResetProviderPassword } from "~/api/GroupProviderApi.ts";
import TemporaryPasswordModal from "~/components/InviteRadModal/TemporaryPasswordModal";
import { useHandleModal } from "~/hooks/useHandleModal";
import { CurrentUser } from "~/types/CurrentUser";
import { GroupProvider } from "~/types/Group";

interface Props {
  groupProvider: GroupProvider;
  currentUser?: CurrentUser;
  navigateToProvider: (groupProviderId: string) => void;
  removeProvider: (id: string) => void;
  setGroupProviderRoleForGroup: (groupProviderId: string, role: "admin" | "member") => void;
  groupId?: string;
}

const ProvidersTableRowMenu: React.FC<Props> = ({
  groupProvider,
  currentUser,
  navigateToProvider,
  removeProvider,
  setGroupProviderRoleForGroup,
  groupId,
}) => {
  const handleModal = useHandleModal();
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const toast = useToast();

  const { mutateAsync: resetPassword } = useResetProviderPassword();

  const handleRoleChange = () => {
    if (groupProvider.role === "admin") {
      handleModal({
        title:
          "Each group must have at least one admin assigned. If this user is the only admin, you won't be able to remove their admin role until another admin is assigned.\n\nThis action cannot be undone.",
        leftButtonTitle: "Cancel",
        rightButtonTitle: "Remove admin",
        onClickRightButton: () => {
          setGroupProviderRoleForGroup(groupProvider.id, "member");
        },
      });
    } else {
      setGroupProviderRoleForGroup(groupProvider.id, "admin");
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await resetPassword({
        groupId: groupId!,
        groupMemberId: groupProvider.id,
      });

      if (response.password) {
        setTemporaryPassword(response.password);
        setIsResetPasswordModalOpen(true);
      } else {
        throw new Error("No temporary password received");
      }
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Menu isLazy autoSelect={false} strategy="fixed">
        <MenuButton>
          <IconButton
            as="span"
            variant="ghost"
            icon={<BiDotsVerticalRounded />}
            aria-label={"Provider Action"}
          />
        </MenuButton>
        <MenuList
          minW="fit-content"
          px="16px"
          borderRadius={16}
          bgColor="darkBlue2.800"
          border="none"
          zIndex={9999}
        >
          <MenuItem
            bgColor="darkBlue2.800"
            color="white"
            paddingY="16px"
            fontWeight="600"
            onClick={() => navigateToProvider(groupProvider.id)}
          >
            View provider
          </MenuItem>
          <Divider color="gray.300" />
          <MenuItem
            bgColor="darkBlue2.800"
            color="white"
            paddingY="16px"
            fontWeight="600"
            onClick={() => {
              handleResetPassword();
            }}
          >
            Reset Password
          </MenuItem>
          {groupProvider.user.id !== currentUser?.id && (
            <>
              <Divider color="gray.300" />
              <MenuItem
                bgColor="darkBlue2.800"
                color={groupProvider.role === "admin" ? "error.400" : "white"}
                paddingY="16px"
                fontWeight="600"
                onClick={handleRoleChange}
              >
                {groupProvider.role === "member" ? "Make Group Admin" : "Remove as Admin"}
              </MenuItem>
              <Divider color="gray.300" />
              <MenuItem
                color="error.400"
                bgColor="darkBlue2.800"
                paddingY="16px"
                fontWeight="600"
                onClick={() => {
                  removeProvider(groupProvider.id);
                }}
              >
                Remove from group
              </MenuItem>
            </>
          )}
        </MenuList>
      </Menu>
      {isResetPasswordModalOpen && (
        <TemporaryPasswordModal
          isOpen={isResetPasswordModalOpen}
          onClose={() => setIsResetPasswordModalOpen(false)}
          temporaryPassword={temporaryPassword}
          isReset={true}
        />
      )}
    </>
  );
};

export default ProvidersTableRowMenu;
