import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, RadioGroup, Stack, Text, VStack } from "@chakra-ui/react";

import { useGetMyGroupsWithLnqRights } from "~api/GroupApi";
import { PROVIDER_PAGES } from "~base/router/pages";
import { MyGroupResponse } from "~types/GroupResponse";
import { WorkListType } from "~types/Worklist";

import ModalContainer from "../ModalContainer/ModalContainer";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (group: MyGroupResponse) => void;
  lnqType?: WorkListType;
}

const GroupsListModal: FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  lnqType = WorkListType.GROUP,
}) => {
  const navigate = useNavigate();
  const [value, setValue] = useState<string | null>();
  const { data } = useGetMyGroupsWithLnqRights(1, 0);
  const groupsWithLnqRights = useMemo(() => data?.docs ?? [], [data?.docs]);

  const showNoGroupsMessage = useMemo(() => {
    return !groupsWithLnqRights || groupsWithLnqRights.length === 0;
  }, [groupsWithLnqRights]);

  const isSingleGroup = useMemo(
    () => groupsWithLnqRights.length === 1,
    [groupsWithLnqRights],
  );

  const containerTitle = useMemo(() => {
    if (showNoGroupsMessage) {
      return "Join a Group";
    }
    const facilityName = groupsWithLnqRights[0]?.facilityName;
    if (isSingleGroup && !groupsWithLnqRights[0]?.paymentMethodAttached) {
      return "To create your first LnQ, you need to have a valid payment method on file.";
    }

    const lnqTypeLabel = lnqType === WorkListType.PERSONAL ? "personal" : "group";

    return isSingleGroup
      ? `You're activating ${lnqTypeLabel} LnQ for your ${facilityName} worklist. Do you want to proceed?`
      : `You're activating ${lnqTypeLabel} LnQ. Please select a group from the list below.`;
  }, [isSingleGroup, groupsWithLnqRights, showNoGroupsMessage, lnqType]);
  const [rightButtonTitle, leftButtonTitle] = useMemo(() => {
    if (isSingleGroup && !groupsWithLnqRights[0]?.paymentMethodAttached) {
      return ["Set Up Payment", "Not Now"];
    }

    return isSingleGroup ? ["Yes", "No"] : ["Confirm", "Cancel"];
  }, [isSingleGroup, groupsWithLnqRights]);

  useEffect(() => {
    if (isOpen) {
      setValue(null);
    }
  }, [isOpen]);

  const onClickConfirm = useCallback(() => {
    if (!groupsWithLnqRights) return;
    if (isSingleGroup && !groupsWithLnqRights[0]?.paymentMethodAttached) {
      navigate(`${PROVIDER_PAGES.groups}/edit/${groupsWithLnqRights[0].id}`);
      return;
    }
    if (isSingleGroup) {
      onConfirm(groupsWithLnqRights[0]);
      return;
    }
    if (!value) return;
    const index = groupsWithLnqRights.findIndex((g) => g.id === value);
    if (index !== -1) {
      onConfirm(groupsWithLnqRights[index]);
    }
  }, [isSingleGroup, groupsWithLnqRights, navigate, onConfirm, value]);

  const handleTakeMeToGroups = useCallback(() => {
    onClose();
    navigate("/groups?tab=allgroups");
  }, [navigate, onClose]);

  if (showNoGroupsMessage) {
    return (
      <ModalContainer
        title={containerTitle}
        leftButtonTitle="Not Now"
        rightButtonTitle="Take me to Groups"
        onClickRightButton={handleTakeMeToGroups}
        onClickLeftButton={onClose}
        isOpen={isOpen}
        onClose={onClose}
      >
        <VStack spacing={4} align="stretch">
          <Text color="white">
            {lnqType === WorkListType.GROUP
              ? "To activate your first group LnQ you must be an admin of at least one group."
              : "To activate your first personal LnQ you must join at least one group."}
          </Text>
        </VStack>
      </ModalContainer>
    );
  }

  if (!groupsWithLnqRights || groupsWithLnqRights.length === 0) {
    return null;
  }

  return (
    <ModalContainer
      title={containerTitle}
      leftButtonTitle={leftButtonTitle}
      rightButtonTitle={rightButtonTitle}
      onClickRightButton={onClickConfirm}
      onClickLeftButton={onClose}
      isOpen={isOpen}
      onClose={onClose}
    >
      {!isSingleGroup ? (
        <RadioGroup onChange={setValue} value={value ?? ""} colorScheme="brandYellow">
          <Stack
            justifyItems="flex-start"
            alignItems="left"
            direction="column"
            textColor="white"
            fontWeight="600"
            overflowY="scroll"
            maxH="300px"
            px={2}
          >
            {groupsWithLnqRights.map((group) => {
              return (
                <Radio key={group.id} value={group.id}>
                  {group.facilityName}
                </Radio>
              );
            })}
          </Stack>
        </RadioGroup>
      ) : null}
    </ModalContainer>
  );
};

export default GroupsListModal;
