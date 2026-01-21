import { TableCaption } from "@chakra-ui/react";

export const TargetedProvidersCaption: React.FC<{ title?: string }> = ({
  title = "Targeted Providers",
}) => (
  <TableCaption
    placement="top"
    textStyle="smBold"
    fontWeight={"800"}
    fontSize="2xl"
    p="0"
    mt="3"
    mb="6"
  >
    {title}
  </TableCaption>
);
