import React from "react";
import { Box, Text, BoxProps } from "@chakra-ui/react";

interface AdminGroupsCodeYellowStatusLabelProps extends BoxProps {
  isActive: boolean;
  isSmall?: boolean;
}

const CodeYellowStatusLabel: React.FC<AdminGroupsCodeYellowStatusLabelProps> = ({
  isActive,
  isSmall = false,
  ...rest
}) => {
  return (
    <Box
      width={isSmall ? "140px" : "200px"}
      height={isSmall ? "32px" : "50px"}
      borderRadius="lg"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={isActive ? "brandYellow.600" : "transparent"}
      border={isActive ? "none" : "1px solid"}
      borderColor={isActive ? "none" : "gray.500"}
      {...rest}
    >
      <Text
        fontSize={isSmall ? "12px" : "16px"}
        fontWeight="bold"
        color={isActive ? "brandBlue.600" : "gray.400"}
      >
        {isActive ? "LnQ Active" : "LnQ Inactive"}
      </Text>
    </Box>
  );
};

export default CodeYellowStatusLabel;
