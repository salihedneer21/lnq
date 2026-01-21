import React from "react";
import { Box, Input, InputGroup, InputLeftElement, BoxProps } from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";

interface SearchInputProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  boxProps?: BoxProps;
  inputHeight?: string | number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Search...",
  boxProps = {},
  inputHeight = "40px",
}) => {
  return (
    <Box minW="416px" maxW="416px" {...boxProps}>
      <InputGroup width="full" maxW="full">
        <InputLeftElement pointerEvents="none" height="100%">
          <FiSearch color="#A0AEC0" />
        </InputLeftElement>
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={onSearchChange}
          pl="2.5rem"
          bg="whiteAlpha.50"
          color="white"
          _placeholder={{ color: "whiteAlpha.500" }}
          h={inputHeight}
        />
      </InputGroup>
    </Box>
  );
};
