import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Box, Button, Flex, Text, Portal } from "@chakra-ui/react";
import { ChevronDownIcon, CheckIcon } from "@chakra-ui/icons";

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange?: (e: any) => void;
  onValueChange?: (value: string) => void;
  [key: string]: any;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  onValueChange,
  ...props
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }

    if (onChange) {
      const syntheticEvent = {
        target: { value: newValue },
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }

    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box position="relative" {...props}>
      <Button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        rightIcon={<ChevronDownIcon color="yellow.400" boxSize={4} />}
        bg="#1a1f2c"
        color="white"
        border="1px solid"
        borderColor="gray.700"
        borderRadius="md"
        px={3}
        py={1.5}
        h="36px"
        fontWeight="medium"
        fontSize="sm"
        minW="120px"
        textAlign="left"
        justifyContent="space-between"
        _hover={{
          borderColor: "yellow.400",
          bg: "rgba(255, 255, 255, 0.06)",
        }}
        _active={{
          bg: "rgba(255, 255, 255, 0.08)",
        }}
        _expanded={{
          borderColor: "yellow.400",
          boxShadow: "0 0 0 1px var(--chakra-colors-yellow-400)",
        }}
      >
        {selectedOption?.label ?? "Select option"}
      </Button>

      {isOpen && (
        <Portal>
          <Box
            ref={menuRef}
            position="absolute"
            top={`${buttonRef.current?.getBoundingClientRect().bottom}px`}
            left={`${buttonRef.current?.getBoundingClientRect().left}px`}
            width={`${buttonRef.current?.offsetWidth}px`}
            bg="#1a1f2c"
            border="1px solid"
            borderColor="gray.700"
            borderRadius="md"
            boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
            zIndex={1000}
            mt="2px"
            overflow="hidden"
          >
            {options.map((option) => (
              <Flex
                key={option.value}
                align="center"
                px={3}
                py={2}
                cursor="pointer"
                bg={option.value === value ? "transparent" : "#1a1f2c"}
                _hover={{ bg: "#2b4acb" }}
                onClick={() => handleSelect(option.value)}
              >
                <Box w="20px" display="inline-flex" mr={1}>
                  {option.value === value && <CheckIcon boxSize={4} color="white" />}
                </Box>
                <Text color="white" fontWeight="medium">
                  {option.label}
                </Text>
              </Flex>
            ))}
          </Box>
        </Portal>
      )}
    </Box>
  );
}
