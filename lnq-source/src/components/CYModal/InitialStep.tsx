import { Box, Text } from "@chakra-ui/react";
import { useMemo } from "react";

interface Props {
  groupName?: string;
  paymentMethodAttached: boolean;
}

const InitialStep = ({ groupName, paymentMethodAttached }: Props) => {
  const title = useMemo(() => {
    if (!paymentMethodAttached) {
      return "To create your first group LnQ, you need to have a valid payment method on file.";
    }

    return `You're activating a group LnQ for the ${groupName} worklist. Do you want to proceed?`;
  }, [groupName, paymentMethodAttached]);
  return (
    <Box justifyContent="center">
      <Text fontSize="24px" fontWeight="700" color="white" textAlign="center">
        {title}
      </Text>
    </Box>
  );
};

export default InitialStep;
