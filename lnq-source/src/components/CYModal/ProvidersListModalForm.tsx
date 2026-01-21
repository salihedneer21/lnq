import React, { FC, useRef } from "react";
import {
  Spinner,
  CheckboxGroup,
  Stack,
  Checkbox,
  Divider,
  Text,
  Tag,
  HStack,
  Box,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Button,
} from "@chakra-ui/react";
import { FaCircleChevronDown } from "react-icons/fa6";

import { useCYProviders } from "../../hooks/useCYProviders.ts";
import { Pagination } from "../Pagination/Pagination";
import { GroupProviderWithQGendaIntegration, Schedule } from "../../types/Group.ts";
import { GroupScheduleModal } from "./GroupSchedule.tsx";
import { UserTimeSettings, useUserTimezoneSettings } from "../../hooks/useUserTimezone.ts";
import { IconType } from "react-icons";
import dayjs from "dayjs";

interface Props {
  targetedProviderSettings: ReturnType<typeof useCYProviders>;
}
interface ProviderWithScheduleProps {
  provider: GroupProviderWithQGendaIntegration;
  userTimeSettings: UserTimeSettings;
}
interface ProviderWithScheduleTimeline extends ProviderWithScheduleProps {
  pre: React.ReactNode;
  onClickViewAll: () => void;
}
interface ScheduleProps {
  show: boolean;
  schedule: Schedule;
  userTimeSettings: UserTimeSettings;
}

const QGendaProviderTag = () => (
  <Tag
    size="sm"
    bg="brandYellowAlphas.100"
    color="brandYellow.600"
    borderRadius="lg"
    verticalAlign="baseline"
    fontWeight="bold"
    ml="2"
  >
    QGenda
  </Tag>
);

const ProviderName: React.FC<Omit<ProviderWithScheduleProps, "userTimeSettings">> = ({
  provider,
}) => {
  const hasSchedule =
    typeof provider?.integration?.data?.providerSchedules?.[0] === "object";

  return (
    <Text color="white" lineHeight="1">
      {provider.user.lastName} {provider.user.firstName}
      {hasSchedule ? <QGendaProviderTag /> : null}
    </Text>
  );
};

const ScheduleRow: React.FC<ScheduleProps> = ({ schedule, userTimeSettings, show }) => {
  return (
    <Box display="flex" alignItems={"flex-end"}>
      {schedule.mode === "ON" ? (
        <Text
          color="inherit"
          textStyle="captionSemi"
          mr="2"
          lineHeight="100%"
          fontSize="10"
          w="100%"
          maxW="160px"
        >
          {schedule?.scheduleStartDateUTC
            ? dayjs(schedule?.scheduleStartDateUTC)
                .tz(userTimeSettings.userTimezone)
                .format("HH:mm")
            : null}
          &nbsp;- &nbsp;
          {schedule?.scheduleEndDateUTC
            ? dayjs(schedule?.scheduleEndDateUTC)
                .tz(userTimeSettings.userTimezone)
                .format("HH:mm")
            : null}
          &nbsp; <Text as="span">({userTimeSettings.userTimezoneAbbreviation})</Text>
          <Text color="inherit" fontSize="10">
            ({schedule.scheduleStartDate.slice(0, 10)})
          </Text>
        </Text>
      ) : null}
      <VStack gap="0" align="center" mb="2" mr="24px">
        {show ? <Box width="1px" bg="gray.400" height="28px" mb="2" flexGrow="1" /> : null}
        <Box borderRadius="4px" width="8px" height="8px" bg="brandYellow.600" />
      </VStack>
      <Text color="inherit" fontSize="xs">
        {schedule.taskName}
      </Text>
    </Box>
  );
};

const ScheduleTimeline: React.FC<ProviderWithScheduleProps> = ({
  provider,
  userTimeSettings,
}) => {
  if (!provider.integration?.data?.providerSchedules) {
    return null;
  }
  return provider.integration?.data?.providerSchedules?.map((schedule, index) => {
    return (
      <ScheduleRow
        schedule={schedule}
        userTimeSettings={userTimeSettings}
        show={index !== 0}
        key={`${schedule.scheduleStartDate}${schedule.scheduleStartTime}${index}`}
      />
    );
  });
};

const ProviderWithTimeline: React.FC<ProviderWithScheduleTimeline> = ({
  provider,
  userTimeSettings,
  pre,
  onClickViewAll,
}) => {
  const noSchedules = provider.integration?.data?.providerSchedules?.length === 0;

  const handleOnClick: React.MouseEventHandler<HTMLButtonElement> | undefined = noSchedules
    ? (e) => {
        e.preventDefault();
        e.stopPropagation();
      }
    : undefined;
  return (
    <AccordionItem
      borderTopWidth={0}
      flex="1"
      borderBottom="1px"
      borderColor="gray.600"
      mb="2"
    >
      <HStack display="flex" gap="0">
        {pre ? (
          <Box mr="2" ml="1" mb="-1">
            {pre}
          </Box>
        ) : null}

        <AccordionButton pl={pre ? "0" : undefined} onClick={handleOnClick}>
          {noSchedules ? null : (
            <AccordionIcon as={FaCircleChevronDown as IconType} mr="2" />
          )}
          <ProviderName provider={provider} />
        </AccordionButton>
      </HStack>
      <AccordionPanel pb={4}>
        <ScheduleTimeline provider={provider} userTimeSettings={userTimeSettings} />
        <Box flexGrow="1" display="flex" alignItems="center" mt="2">
          <Button
            variant="link"
            mr="auto"
            ml="auto"
            size="sm"
            colorScheme="brandYellow"
            fontSize="xs"
            onClick={onClickViewAll}
          >
            View All
          </Button>
        </Box>
      </AccordionPanel>
    </AccordionItem>
  );
};

const getHideCheckboxIfDisabled = (flag?: boolean) => {
  const controlStyle = { display: flag ? "block" : "none" };
  const hideIfDisabledStyles = {
    [`.chakra-checkbox__control[data-disabled]`]: controlStyle,
  };

  return hideIfDisabledStyles;
};
const ProviderOnlyName: React.FC<Omit<ProviderWithScheduleProps, "userTimeSettings">> = ({
  provider,
}) => {
  return <ProviderName provider={provider} />;
};

const ProviderSelectableItem = ({
  provider,
  onSelectItem,
  getIsItemSelected,
  userTimeSettings,
  onlyName,
  targetProviders,
  onClickViewAll,
}: {
  provider: GroupProviderWithQGendaIntegration;
  onSelectItem: (id: string) => void;
  getIsItemSelected: (id: string) => boolean;
  userTimeSettings: UserTimeSettings;
  onlyName?: boolean;
  targetProviders?: boolean;
  onClickViewAll: () => void;
}) => {
  if (onlyName) {
    return (
      <Checkbox
        colorScheme="brandYellow"
        key={provider.id} // Ensure unique key
        onChange={() => {
          onSelectItem(provider.user.id);
        }}
        sx={getHideCheckboxIfDisabled(targetProviders)}
        value={provider.user.id}
        mb="3"
        isChecked={getIsItemSelected(provider.user.id)}
        alignItems="unset"
        lineHeight={"1.2rem"}
      >
        <ProviderOnlyName provider={provider} />
      </Checkbox>
    );
  }
  return (
    <ProviderWithTimeline
      pre={
        targetProviders ? (
          <Checkbox
            colorScheme="brandYellow"
            key={provider.id} // Ensure unique key
            onChange={() => {
              onSelectItem(provider.user.id);
            }}
            value={provider.user.id}
            isChecked={getIsItemSelected(provider.user.id)}
            alignItems="unset"
            p="0"
            mb="-2px"
          />
        ) : null
      }
      provider={provider}
      userTimeSettings={userTimeSettings}
      onClickViewAll={onClickViewAll}
    />
  );
};

const ProvidersList: FC<
  Props & {
    accordionEnabled: boolean;
    onClickViewAll: ProviderWithScheduleTimeline["onClickViewAll"];
  }
> = ({
  targetedProviderSettings: { providers, onSelectItem, getIsItemSelected, targetProviders },
  accordionEnabled,
  onClickViewAll,
}) => {
  const userTimezoneSettings = useUserTimezoneSettings();

  if (!accordionEnabled) {
    return providers.map((provider) => (
      <ProviderSelectableItem
        key={provider.id}
        provider={provider}
        onSelectItem={onSelectItem}
        getIsItemSelected={getIsItemSelected}
        userTimeSettings={userTimezoneSettings}
        onClickViewAll={onClickViewAll}
        onlyName
      />
    ));
  }

  return (
    <Accordion allowMultiple>
      {providers.map((provider) => (
        <ProviderSelectableItem
          key={provider.id}
          provider={provider}
          onSelectItem={onSelectItem}
          getIsItemSelected={getIsItemSelected}
          userTimeSettings={userTimezoneSettings}
          targetProviders={targetProviders}
          onClickViewAll={onClickViewAll}
        />
      ))}
    </Accordion>
  );
};

const Providers: FC<Props> = ({ targetedProviderSettings }) => {
  const modalRef = useRef<{ open: () => void } | null>(null);
  const {
    allToggled,
    isIndeterminate,
    isLoading,
    selectedIds,
    onToggleCheckAll,
    targetProviders,
    mode,
    groupId,
    page,
    setPage,
    totalPages,
  } = targetedProviderSettings;
  const isNotAllMode = mode !== "all";

  const SelectAllCheckbox = targetProviders ? (
    <>
      <Checkbox
        isChecked={allToggled}
        isIndeterminate={isIndeterminate}
        onChange={onToggleCheckAll}
        colorScheme="brandYellow"
        sx={getHideCheckboxIfDisabled(targetProviders)}
        mb="3"
      >
        Select All
      </Checkbox>
      <Divider borderColor="gray.600" mb="2" width="70%" />
    </>
  ) : null;

  const handleOpenModal = () => modalRef?.current?.open();

  return (
    <>
      {isLoading ? (
        <Spinner color="white" size="xl" />
      ) : (
        <>
          <CheckboxGroup value={selectedIds} size="sm" isDisabled={!targetProviders}>
            <Stack spacing="0" textStyle="bodySemi" overflowY="scroll">
              {SelectAllCheckbox}
              <HStack justifyContent="space-between">
                <Text fontSize="x-small" color="gray.500" mb="1">
                  Selected Providers: {selectedIds.length}
                </Text>
                <GroupScheduleModal groupId={groupId!} mode={mode} ref={modalRef} />
              </HStack>
              <ProvidersList
                targetedProviderSettings={targetedProviderSettings}
                accordionEnabled={isNotAllMode}
                onClickViewAll={handleOpenModal}
              />
              {totalPages > 1 && (
                <Box mt="4" display="flex" justifyContent="center">
                  <Pagination pages={totalPages} currentPage={page} setPage={setPage} />
                </Box>
              )}
            </Stack>
          </CheckboxGroup>
        </>
      )}
    </>
  );
};

export default Providers;
