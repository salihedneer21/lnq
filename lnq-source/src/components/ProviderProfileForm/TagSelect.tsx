import {
  FormControl,
  FormLabel,
  Select,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";

interface TagSelectProps {
  label: string;
  placeholder: string;
  options: readonly string[] | { value: string; label: string }[];
  selectedValues: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

export const TagSelect = ({
  label,
  placeholder,
  options,
  selectedValues,
  onAdd,
  onRemove,
}: TagSelectProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue && !selectedValues.includes(selectedValue)) {
      onAdd(selectedValue);
    }
  };

  const getOptionLabel = (option: string | { value: string; label: string }) => {
    return typeof option === "string" ? option : option.label;
  };

  const getOptionValue = (option: string | { value: string; label: string }) => {
    return typeof option === "string" ? option : option.value;
  };

  return (
    <FormControl variant="floating">
      <Select
        border="1px solid white"
        aria-label={label}
        color="white"
        bg="darkBlue2.900"
        borderColor="gray.600"
        _hover={{ borderColor: "gray.500" }}
        // _focus={{ borderColor: "brandYellow.600" }}
        value=""
        height="50px"
        onChange={handleChange}
        sx={{
          option: {
            backgroundColor: "darkBlue2.900",
            color: "white",
          },
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </option>
        ))}
      </Select>
      <FormLabel bg="darkBlue2.900 !important" color="gray.400">
        {label}
      </FormLabel>
      <HStack mt={2} spacing={2}>
        {selectedValues.map((item) => (
          <Tag key={item} colorScheme="brandYellow" bg="white">
            <TagLabel color="brandBlue.800">{item}</TagLabel>
            <TagCloseButton color="brandBlue.800" onClick={() => onRemove(item)} />
          </Tag>
        ))}
      </HStack>
    </FormControl>
  );
};
