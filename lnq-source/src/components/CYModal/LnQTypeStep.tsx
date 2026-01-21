import { Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { WorkListType } from "../../types/Worklist";

interface LnQTypeStepProps {
  lnqType: WorkListType;
  setLnqType: (type: WorkListType) => void;
}

const LnQTypeStep = ({ lnqType, setLnqType }: LnQTypeStepProps) => {
  return (
    <>
      <Text color="white" fontSize="24" fontWeight="600" textAlign="center" mb="6">
        Are you activating a personal LnQ or a group LnQ?
      </Text>
      <RadioGroup
        onChange={(value) => setLnqType(value as WorkListType)}
        value={lnqType}
        colorScheme="yellow"
      >
        <Stack direction="column" spacing={4}>
          <Radio value={WorkListType.PERSONAL}>
            <Text color="white">Personal LnQ</Text>
          </Radio>
          <Radio value={WorkListType.GROUP}>
            <Text color="white">Group LnQ</Text>
          </Radio>
        </Stack>
      </RadioGroup>
    </>
  );
};

export default LnQTypeStep;
