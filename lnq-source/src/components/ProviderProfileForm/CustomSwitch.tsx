import { HStack, Text, Switch } from "@chakra-ui/react";

interface CustomSwitchProps {
  label: string;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
}

export const CustomSwitch = ({ label, isChecked, onChange }: CustomSwitchProps) => (
  <HStack justify="space-between">
    <Text color="white" fontSize="sm">
      {label}
    </Text>
    <Switch
      colorScheme="brandYellow"
      isChecked={isChecked}
      onChange={(e) => onChange(e.target.checked)}
      size="md"
      sx={{
        "span.chakra-switch__track": {
          bg: "gray.600",
          _checked: {
            bg: "brandBlue.800",
          },
        },
        "span.chakra-switch__thumb": {
          bg: "white",
          _checked: {
            bg: "brandYellow.600",
          },
        },
      }}
    />
  </HStack>
);
