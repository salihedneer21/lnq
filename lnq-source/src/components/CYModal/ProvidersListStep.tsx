import { FC } from "react";
import ProvidersList from "./ProvidersListModalForm";
import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Divider,
  Button,
  SimpleGrid,
  Tag,
} from "@chakra-ui/react";
import Switch from "../Switch/Switch.tsx";
import { ProvidersScheduleMode } from "../../types/Group.ts";
import { useCYProviders } from "../../hooks/useCYProviders.ts";

interface Props {
  targetedProviderSettings: ReturnType<typeof useCYProviders>;
}

const QGendaTag = () => (
  <Tag
    position="absolute"
    top="-5"
    left="-1"
    fontSize="0.5rem"
    size="sm"
    variant="outline"
    boxShadow="unset"
  >
    QGenda RADs
  </Tag>
);

const ProvidersListStep: FC<Props> = ({ targetedProviderSettings }) => {
  const { mode, onModeChange, onToggleTargetProviders, ...restOfTargetedProviderSettings } =
    targetedProviderSettings;
  const map = new Map<ProvidersScheduleMode, "brandYellow.600">([
    [mode, "brandYellow.600"],
  ]);

  return (
    <Box>
      <Text textStyle="bodyBold" fontSize={"2xl"} color="white" textAlign="center" mb="8">
        Provider list
      </Text>
      <FormControl display="flex" alignItems="center" justifyContent="space-between" mb="5">
        <FormLabel
          htmlFor="target-providers"
          mb="0"
          color="gray.500"
          fontSize="sm"
          fontWeight="bold"
        >
          Target specific set of providers
        </FormLabel>
        <Switch
          isToggled={restOfTargetedProviderSettings.targetProviders}
          onToggle={onToggleTargetProviders}
        />
      </FormControl>
      <Divider borderColor="gray.600" mb="6" />
      <SimpleGrid columns={3} spacing="2" mb="6">
        <Button
          variant="outline"
          onClick={onModeChange("all")}
          color={map.get("all") ?? "white"}
          size="xs"
        >
          All
        </Button>
        <Button
          variant="outline"
          onClick={onModeChange("on-shift")}
          color={map.get("on-shift") ?? "white"}
          size="xs"
        >
          On Shift
          <QGendaTag />
        </Button>

        <Button
          flex="1"
          variant="outline"
          onClick={onModeChange("off-shift")}
          color={map.get("off-shift") ?? "white"}
          size="xs"
        >
          Off Shift
          <QGendaTag />
        </Button>
      </SimpleGrid>

      <Divider borderColor="gray.600" mb="6" />

      <ProvidersList targetedProviderSettings={targetedProviderSettings} />
    </Box>
  );
};

export default ProvidersListStep;
