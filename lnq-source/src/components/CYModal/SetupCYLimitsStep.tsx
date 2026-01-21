import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Icon,
} from "@chakra-ui/react";
import { ChangeEvent, FC, useState, useEffect } from "react";
import { Limits } from "../../types/CodeYellow";
import { IoCheckbox } from "react-icons/io5";
import { IconType } from "react-icons";

interface SetupCYLimitsStepProps {
  setLimits: (limits: Limits) => void;
  initialLimits?: Limits;
}

const SetupCYLimitsStep: FC<SetupCYLimitsStepProps> = ({ setLimits, initialLimits }) => {
  const [dollar, setDollar] = useState<string>(
    initialLimits?.amountLimit?.toString() ?? "",
  );
  const [rvuValue, setRvuValue] = useState<string>(
    initialLimits?.RVUsLimit?.toString() ?? "",
  );

  useEffect(() => {
    setLimits({
      amountLimit: dollar ? Number.parseFloat(dollar) : undefined,
      RVUsLimit: rvuValue ? Number.parseFloat(rvuValue) : undefined,
    });
  }, [dollar, rvuValue, setLimits]);

  const handleDollarChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDollar(e.target.value);
  };

  const handleRvuChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRvuValue(e.target.value);
  };

  return (
    <Box justifyContent="center">
      <Text fontSize="24px" fontWeight="700" color="white" textAlign="center" mb={4}>
        Total RVU or Total $ threshold
      </Text>
      <FormControl>
        <FormLabel textColor="gray.500">
          These parameters are optional. You may choose to provide one, both, or neither.
        </FormLabel>
        <InputGroup mb={4}>
          <InputLeftElement color="white" pointerEvents="none" fontSize="1.2em">
            $
          </InputLeftElement>
          <Input
            placeholder="Dollar (optional)"
            value={dollar}
            onChange={handleDollarChange}
            color="white"
            type="number"
          />
        </InputGroup>
        {dollar && (
          <Box display="flex" alignItems="center" mt={2} mb={4}>
            <Icon as={IoCheckbox as IconType} color="blue.500" mr={2} boxSize={6} />
            <Text color="white">
              LnQ alert will be deactivated when threshold is reached
            </Text>
          </Box>
        )}
        <InputGroup mb={4} mt={8}>
          <Input
            placeholder="RVU (optional)"
            value={rvuValue}
            onChange={handleRvuChange}
            color="white"
            type="number"
          />
        </InputGroup>
        {rvuValue && (
          <Box display="flex" alignItems="center" mt={2} mb={8}>
            <Icon as={IoCheckbox as IconType} color="blue.500" mr={2} boxSize={6} />
            <Text color="white">
              LnQ alert will be deactivated when threshold is reached
            </Text>
          </Box>
        )}
      </FormControl>
    </Box>
  );
};

export default SetupCYLimitsStep;
