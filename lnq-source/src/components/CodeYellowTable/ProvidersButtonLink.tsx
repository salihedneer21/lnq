import { Button } from "@chakra-ui/react";
import { CodeYellow } from "../../types/CodeYellow";
import { CodeYellowResponse } from "../../types/CodeYellowResponse";
import { MyGroupResponse } from "../../types/GroupResponse";

const ProvidersButtonLink = ({
  codeYellow,
  group,
  count,
  onClick,
}: {
  codeYellow: CodeYellow | CodeYellowResponse;
  group?: MyGroupResponse;
  count?: number;
  onClick: (codeYellow: CodeYellow | CodeYellowResponse) => void;
}) => {
  const isAdmin = (codeYellow as CodeYellowResponse)?.canManage || group?.isAdmin;

  const isDisabled = !isAdmin || count === 0 || typeof count === "undefined";
  return (
    <Button
      variant="link"
      textStyle={"smBold"}
      colorScheme="brandYellow"
      disabled={isDisabled}
      cursor={isDisabled ? "not-allowed" : "pointer"}
      sx={{
        _hover: {
          textDecoration: isDisabled ? "none" : "underline",
        },
      }}
      onClick={isDisabled ? undefined : () => onClick(codeYellow)}
    >
      {count == 0 ? "-" : count}
    </Button>
  );
};

export default ProvidersButtonLink;
