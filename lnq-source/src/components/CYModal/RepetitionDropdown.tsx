import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { INPUT_SIZES } from "../../constants/inputSizes";

interface RepetitionDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  isDisabled?: boolean;
  size?: "standard" | "date" | "number" | "small";
  placeholder?: string;
}

export const RepetitionDropdown: React.FC<RepetitionDropdownProps> = ({
  value,
  options,
  onSelect,
  isDisabled = false,
  size = "standard",
  placeholder,
}) => {
  const getWidth = () => {
    switch (size) {
      case "date":
        return INPUT_SIZES.DATE;
      case "number":
        return INPUT_SIZES.NUMBER;
      case "small":
        return INPUT_SIZES.SMALL;
      default:
        return INPUT_SIZES.STANDARD;
    }
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Menu>
      <MenuButton
        isDisabled={isDisabled}
        as={Button}
        rightIcon={<ChevronDownIcon />}
        w={getWidth()}
        variant="outline"
        color="white"
        textAlign="left"
        textTransform="capitalize"
      >
        {selectedOption?.label ?? placeholder ?? "Select option"}
      </MenuButton>
      <MenuList bg="darkBlue2.900" border="none" minW={getWidth()}>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            color="white"
            bg="darkBlue2.900"
            _hover={{ bg: "darkBlue2.800" }}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
