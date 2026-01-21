import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { useUpdateCYAvailability } from "../../api/CodeYellowAvailabilityApi";
import Switch from "../Switch/Switch";
import { useUserData } from "../../api/UserApi";

interface Props {
  codeYellowId: string;

  userResponded: boolean;
}

export const CodeYellowAvailable = ({ codeYellowId, userResponded }: Props) => {
  const { data: currentUser } = useUserData();

  const [available, setAvailable] = useState(userResponded);

  const { mutate: updateAvailability, isPending } = useUpdateCYAvailability();

  const handleAvailabilityChange = () => {
    setAvailable(!available);

    updateAvailability({
      codeYellowId,
      userId: currentUser!.id,
      optIn: !available,
    });
  };

  return (
    <Box display="flex" width="16" alignItems="center">
      <Switch
        isToggled={available}
        onToggle={() => handleAvailabilityChange()}
        disabled={isPending}
      />
    </Box>
  );
};
