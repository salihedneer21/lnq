import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react";
import { ChangeEvent } from "react";

interface Props {
  rvu: number;
  setRvu: (rvu: number) => void;
}
const onlyDigitsWithNoLeadingZeroRegex = /^0+|[^0-9]/g;

const SetupRVUStep = ({ rvu, setRvu }: Props) => {
  const handleRvuChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newRvu = e.target.value.replace(onlyDigitsWithNoLeadingZeroRegex, "");
    setRvu(Number(newRvu));
  };
  return (
    <Box justifyContent="center">
      <Text fontSize="24px" fontWeight="700" color="white" textAlign="center">
        Setup $/RVU
      </Text>
      <FormControl variant="floating" pt={4}>
        <InputGroup>
          <InputLeftElement color="white" pointerEvents="none" fontSize="1.2em" pt={4}>
            $
          </InputLeftElement>
          <Input
            color="white"
            aria-label="RVU"
            name="RVU"
            required
            value={rvu}
            onChange={handleRvuChange}
            isInvalid={rvu == 0}
          />
          <FormLabel style={{ backgroundColor: "#2c3054" }}>RVU</FormLabel>
        </InputGroup>
      </FormControl>
    </Box>
  );
};

export default SetupRVUStep;
