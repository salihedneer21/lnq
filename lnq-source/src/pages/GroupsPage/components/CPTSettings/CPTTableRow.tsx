import React from "react";
import { Td, Tr, Box, Text } from "@chakra-ui/react";
import { THEME_COLORS } from "~/base/theme/foundations/colors";
import { CPTInput } from "./CPTInput";

interface CPTTableRowProps {
  item: {
    cptCode: string;
    masterRVU: number;
    groupRVU: number;
  };
  editMode: boolean;
  editingValue: number;
  onRVUChange: (value: string) => void;
  onEditClick: () => void;
  onSaveClick: () => void;
  onPressEnter: () => void;
}

export const CPTTableRow: React.FC<CPTTableRowProps> = ({
  item,
  editMode,
  editingValue,
  onRVUChange,
  onEditClick,
  onSaveClick,
  onPressEnter,
}) => (
  <Tr border="none">
    <Td
      border="none"
      p={{ base: 2, md: 3 }}
      verticalAlign="top"
      minW={{ base: "120px", md: "auto" }}
    >
      <CPTInput
        value={item.cptCode}
        isReadOnly
        type="text"
        label="CPT Code"
        color={THEME_COLORS.amber[700]}
      />
    </Td>

    <Td
      border="none"
      p={{ base: 2, md: 2 }}
      verticalAlign="top"
      minW={{ base: "100px", md: "auto" }}
    >
      <CPTInput
        value={item.masterRVU}
        isReadOnly
        type="number"
        label="RVU's"
        color={THEME_COLORS.amber[700]}
      />
    </Td>

    <Td
      border="none"
      p={{ base: 2, md: 3 }}
      verticalAlign="top"
      minW={{ base: "140px", md: "auto" }}
    >
      <Box position="relative">
        <CPTInput
          value={
            editMode && editingValue === 0 ? "" : editMode ? editingValue : item.groupRVU
          }
          isReadOnly={!editMode}
          type="number"
          label="Group RVU"
          color="white"
          borderColor="gray.600"
          step="0.01"
          min=""
          pr={{ base: "3.5rem", md: "4.5rem" }}
          onChange={(e) => onRVUChange(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              onPressEnter();
            }
          }}
        />
        <Box
          position="absolute"
          right="12px"
          top="50%"
          transform="translateY(-50%)"
          zIndex={1}
        >
          {!editMode ? (
            <Text
              color="brandYellow.500"
              fontWeight="bold"
              cursor="pointer"
              onClick={onEditClick}
              fontSize={{ base: "xs", md: "sm" }}
            >
              Edit
            </Text>
          ) : (
            <Text
              color="brandYellow.500"
              fontWeight="bold"
              cursor="pointer"
              onClick={onSaveClick}
              fontSize={{ base: "xs", md: "sm" }}
            >
              Save
            </Text>
          )}
        </Box>
      </Box>
    </Td>
  </Tr>
);
