import { Td, Tr, Text } from "@chakra-ui/react";
import React from "react";
import Switch from "../Switch/Switch";
import { useUpdateCYAvailability } from "../../api/CodeYellowAvailabilityApi";
import { CodeYellowTargetedProvidersWithAvailabilityResponse } from "../../api/CodeYellowApi";

interface Props {
  provider: CodeYellowTargetedProvidersWithAvailabilityResponse["targetedProviders"][number];
}

const TargetedProvider: React.FC<Props> = ({ provider }) => {
  return provider.name;
};

const TargetedProviderOptInOut: React.FC<
  Props & {
    codeYellowId: string | null;
    showSwitch?: boolean;
    currentUser?: { id: string };
  }
> = ({ provider, codeYellowId, showSwitch = true, currentUser }) => {
  const { mutate } = useUpdateCYAvailability();

  const handleChangeAvailability = () => {
    mutate({
      codeYellowId: codeYellowId!,
      userId: provider.id,
      optIn: !provider.availability,
    });
  };

  const isCurrentUser = currentUser?.id === provider.id;
  const canChangeStatus = isCurrentUser || provider.canOptOut;

  if (!canChangeStatus && !showSwitch) {
    return null;
  }

  return (
    <Switch
      isToggled={provider.availability}
      onToggle={handleChangeAvailability}
      disabled={!canChangeStatus}
    />
  );
};

const TargetedProvidersRow: React.FC<
  Props & {
    codeYellowId: string | null;
    showSwitch?: boolean;
    currentUser?: { id: string };
  }
> = ({ provider, codeYellowId, showSwitch = true, currentUser }) => {
  return (
    <Tr>
      <Td>
        <Text color="white">
          <TargetedProvider provider={provider} key={provider.id} />
        </Text>
      </Td>
      <Td textAlign="right">
        <TargetedProviderOptInOut
          provider={provider}
          codeYellowId={codeYellowId}
          showSwitch={showSwitch}
          currentUser={currentUser}
        />
      </Td>
    </Tr>
  );
};

export default TargetedProvidersRow;
