import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
} from "@chakra-ui/react";
import { LnqRepeat } from "../../types/CodeYellow";
import { useDeactivateLnqRepeat } from "../../api/CodeYellowApi";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useHandleModal } from "../../hooks/useHandleModal";

interface Props {
  lnqRepeat: LnqRepeat;
}

const RepeatingLnQRowMenu = ({ lnqRepeat }: Props) => {
  const toast = useToast();
  const handleModal = useHandleModal();
  const { mutate: deactivateLnqRepeat } = useDeactivateLnqRepeat();

  const onDeactivate = () => {
    handleModal({
      title: `Are you sure you want to deactivate this repeating LnQ?

            This will stop new LnQ alerts from being generated based on this repeating schedule. Existing scheduled LnQs will remain active unless manually canceled.`,
      leftButtonTitle: "Cancel",
      rightButtonTitle: "Deactivate",
      onClickRightButton: () => {
        deactivateLnqRepeat(
          { lnqRepeatId: lnqRepeat.id ?? "" },
          {
            onSuccess: () => {
              toast({
                title: "Repeating LnQ deactivated",
                description: "The repeating LnQ has been successfully deactivated.",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            },
            onError: (error) => {
              toast({
                title: "Error deactivating LnQ",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
              });
            },
          },
        );
      },
    });
  };

  return (
    <Menu isLazy autoSelect={false}>
      <MenuButton
        as={IconButton}
        icon={<BiDotsVerticalRounded size={20} />}
        variant="ghost"
        size="sm"
      />
      <MenuList
        minW="fit-content"
        px="16px"
        borderRadius={16}
        bgColor="darkBlue2.800"
        border="none"
      >
        <MenuItem
          onClick={onDeactivate}
          bgColor="darkBlue2.800"
          color="error.400"
          paddingY="16px"
          fontWeight="600"
        >
          Deactivate
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default RepeatingLnQRowMenu;
