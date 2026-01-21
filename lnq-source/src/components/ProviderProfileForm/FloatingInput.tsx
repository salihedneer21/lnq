import { FormControl, FormLabel, Input } from "@chakra-ui/react";

interface FloatingInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const FloatingInput = ({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder = "",
}: FloatingInputProps) => (
  <FormControl variant="floating">
    <Input
      border="1px solid white"
      color="white"
      placeholder={placeholder}
      aria-label={label}
      name={label.toLowerCase().replace(/\s+/g, "")}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      bg="darkBlue2.900"
      borderColor="gray.600"
      _hover={{ borderColor: "gray.500" }}
      _focus={{ borderColor: "brandYellow.600" }}
      disabled={disabled}
    />
    <FormLabel bg="darkBlue2.900 !important" color="gray.400">
      {label}
    </FormLabel>
  </FormControl>
);
