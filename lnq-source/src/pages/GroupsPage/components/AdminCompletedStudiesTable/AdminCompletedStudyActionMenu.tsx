import { Menu, MenuButton, IconButton, MenuList, MenuItem } from "@chakra-ui/react";
import React from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";

import { AdminCompletedStudy } from "~types/AdminCompletedStudy";

interface Props {
  study: AdminCompletedStudy;
  onMarkAsPaid: (studyId: string) => void;
}

const AdminCompletedStudyActionMenu: React.FC<Props> = ({ study, onMarkAsPaid }) => {
  const canMarkAsPaid = study.paymentStatus === "PAYABLE";

  if (!canMarkAsPaid) {
    return null;
  }

  return (
    <Menu isLazy autoSelect={false}>
      <MenuButton>
        <IconButton
          as="span"
          variant="ghost"
          icon={<BiDotsVerticalRounded />}
          aria-label="Study Actions"
          size="sm"
        />
      </MenuButton>
      <MenuList
        minW="fit-content"
        px="16px"
        borderRadius={16}
        bgColor="darkBlue2.800"
        border="none"
      >
        <MenuItem
          bgColor="darkBlue2.800"
          color="white"
          paddingY="16px"
          fontWeight="600"
          onClick={() => onMarkAsPaid(study.id)}
        >
          Mark as Paid
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default AdminCompletedStudyActionMenu;
