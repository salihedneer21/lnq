import React from "react";
import { Input, FormControl, FormLabel } from "@chakra-ui/react";
import { THEME_COLORS } from "~/base/theme/foundations/colors";

interface CPTInputProps {
  value: string | number;
  isReadOnly?: boolean;
  type?: "text" | "number";
  label: string;
  color?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
  min?: string;
  pr?: string | Record<string, string>;
  borderColor?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const CPTInput: React.FC<CPTInputProps> = ({
  value,
  isReadOnly = false,
  type = "text",
  label,
  color = "#B45309",
  onChange,
  step,
  min,
  pr,
  borderColor = THEME_COLORS.amber[700],
  onKeyDown,
}) => (
  <FormControl variant="floating" maxW="full" position="relative">
    <Input
      value={value}
      isReadOnly={isReadOnly}
      type={type}
      color={color}
      fontWeight="bold"
      size={{ base: "sm", md: "md" }}
      onChange={onChange}
      step={step}
      min={min}
      pr={pr}
      onKeyDown={onKeyDown}
      sx={{
        background: "transparent",
        border: "1px solid",
        borderColor: borderColor,
        fontSize: { base: "14px", md: "16px" },
        minHeight: { base: "36px", md: "40px" },
        boxShadow: "none",
        fontWeight: "400",
      }}
    />
    <FormLabel
      style={{
        color: color,
        backgroundColor: THEME_COLORS.darkBlue[900],
      }}
      fontSize={{ base: "12px", md: "14px" }}
    >
      {label}
    </FormLabel>
  </FormControl>
);
