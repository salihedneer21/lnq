import React from "react";
import { Text, TextProps } from "@chakra-ui/react";

interface RVUValueProps {
  displayValue?: string;
}

export const RVUValue: React.FC<RVUValueProps & TextProps> = ({
  displayValue,
  ...textProps
}) => {
  return <Text {...textProps}>{displayValue ?? "TBD"}</Text>;
};
