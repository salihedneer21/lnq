import { useRef, useState, useCallback, useMemo } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Spinner, useToast } from "@chakra-ui/react";

import { useHomeGroups } from "~/pages/HomePage/hooks/useHomeGroups";
import { useGetUserWorklists } from "~/api/WorklistApi";
import { CodeYellowTable } from "~/components/CodeYellowTable/CodeYellowTable";
import { CYModal } from "~/components/CYModal/CYModal";
import GroupsListModal from "~/components/GroupsListModal/GroupsListModal";
import LnQManager from "~/components/LnQManager/LnQManager";
import UserHasNoGroup from "~/components/UserHasNoGroups/UserHasNoGroup";
import { useCreateLnQ } from "~/hooks/useCreateLnQ";
import { MyGroupResponse } from "~/types/GroupResponse";
import { WorkListType } from "~/types/Worklist";
import { FullPageLoader } from "~/components/FullPageLoader";

import type { ActivateLnQOptions } from "~/types/ActivateLnqOptions";

const HomePage = (): JSX.Element => {
  const toast = useToast();
  const { isLoadingGroups, isFetchingGroups, isFetchedGroups, hasGroups } = useHomeGroups();
  const { data: userWorklist } = useGetUserWorklists();
  const { createLnQ } = useCreateLnQ();

  const [selectedGroup, setSelectedGroup] = useState<MyGroupResponse | null>(null);
  const [skipGroupSelection, setSkipGroupSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCYModalOpen, setIsCYModalOpen] = useState(false);
  const [isGroupsModalOpen, setIsGroupsModalOpen] = useState(false);
  const [lnqType, setLnqType] = useState<WorkListType>(WorkListType.GROUP);

  const hasSelectedPersonal = useRef(false);
  const isModalTransitioning = useRef(false);

  const handleCreateLnQClick = useCallback(() => {
    if (!hasGroups) {
      toast({
        title: "Group Required",
        description: "You need to be a member of a group before you can create a LnQ.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      isModalTransitioning.current = false;
      return;
    }

    setSelectedGroup(null);
    setLnqType(WorkListType.GROUP);
    setSkipGroupSelection(false);
    hasSelectedPersonal.current = false;
    setIsCYModalOpen(true);
    setTimeout(() => {
      isModalTransitioning.current = false;
    }, 100);
  }, [hasGroups, toast]);

  const handleCYModalClose = useCallback(() => {
    setIsCYModalOpen(false);
    setSelectedGroup(null);
    setSkipGroupSelection(false);
    hasSelectedPersonal.current = false;
  }, []);

  const handleGroupModalClose = useCallback(() => {
    setIsGroupsModalOpen(false);
  }, []);

  const handleLnQTypeSelected = useCallback((type: WorkListType) => {
    if (isModalTransitioning.current) {
      return; // Prevent multiple transitions
    }

    isModalTransitioning.current = true;
    setLnqType(type);

    hasSelectedPersonal.current = type === WorkListType.PERSONAL;
    setIsCYModalOpen(false);

    setTimeout(() => {
      setIsGroupsModalOpen(true);
      isModalTransitioning.current = false;
    }, 50);
  }, []);

  const handleGroupSelected = useCallback((group: MyGroupResponse) => {
    setSelectedGroup(group);
    setIsGroupsModalOpen(false);
    setIsCYModalOpen(true);
  }, []);

  const handleActivateLnQ = (opts: ActivateLnQOptions) => {
    if (isModalTransitioning.current) {
      return; // Prevent multiple activations during transitions
    }

    isModalTransitioning.current = true;
    setIsSubmitting(true);

    let worklistId: string | undefined;
    if (lnqType === WorkListType.PERSONAL && userWorklist) {
      worklistId = userWorklist.id;
    } else if (lnqType === WorkListType.GROUP && selectedGroup) {
      worklistId = selectedGroup.worklistId;
    }

    if (!worklistId) {
      isModalTransitioning.current = false;
      setIsSubmitting(false);
      return;
    }

    const groupIdToUse = opts.groupId ?? selectedGroup?.id;

    createLnQ(
      {
        worklistId,
        distributionType: opts.distributionType,
        usdPerRvu: opts.rvu,
        userIDs: opts.userIDs,
        groupId: groupIdToUse,
        dateRange: opts.dateRange,
        limits: opts.limits,
        repetitionEnabled: opts.repetitionEnabled,
        repetitionSettings: opts.repetitionSettings,
        lnqName: opts.lnqName,
      },
      {
        onSuccess: () => {
          setSelectedGroup(null);
          setSkipGroupSelection(false);
          hasSelectedPersonal.current = false;
          isModalTransitioning.current = false;
          setIsSubmitting(false);
        },
        onError: () => {
          isModalTransitioning.current = false;
          setIsSubmitting(false);
        },
        onFinally: () => {
          isModalTransitioning.current = false;
          setIsSubmitting(false);
        },
      },
    );
  };

  const groupsContent = useMemo(() => {
    if (!isFetchedGroups || isLoadingGroups || isFetchingGroups) return <FullPageLoader />;

    return hasGroups ? <CodeYellowTable /> : <UserHasNoGroup />;
  }, [isLoadingGroups, isFetchingGroups, isFetchedGroups, hasGroups]);

  return (
    <Box>
      <LnQManager />
      <Flex justifyContent="flex-end" mt={4} mb={2} mr={4}>
        <Button
          leftIcon={isSubmitting ? <Spinner size="sm" /> : <AddIcon />}
          colorScheme="yellow"
          variant="solid"
          onClick={handleCreateLnQClick}
          isDisabled={isModalTransitioning.current ?? isSubmitting}
          isLoading={isSubmitting}
        >
          Create LnQ
        </Button>
      </Flex>

      {groupsContent}

      {/* Modal for selecting LnQ type and completing configuration */}
      <CYModal
        isOpen={isCYModalOpen}
        onClose={handleCYModalClose}
        showLnQTypeSelection={
          hasGroups && !selectedGroup && !skipGroupSelection && !hasSelectedPersonal.current
        }
        onLnQTypeSelected={handleLnQTypeSelected}
        activate={handleActivateLnQ}
        type={getLnQType()}
        groupId={selectedGroup?.id}
        groupName={selectedGroup?.facilityName}
      />

      {/* Modal for selecting group */}
      <GroupsListModal
        isOpen={isGroupsModalOpen}
        onClose={handleGroupModalClose}
        onConfirm={handleGroupSelected}
        lnqType={lnqType}
      />
    </Box>
  );

  function getLnQType(): WorkListType {
    if (hasSelectedPersonal.current) {
      return WorkListType.PERSONAL; // If user chose Personal, keep that type
    }

    if (selectedGroup) {
      return WorkListType.GROUP;
    }

    return lnqType;
  }
};

export default HomePage;
