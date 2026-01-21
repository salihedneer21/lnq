import { TableContainer, TableContainerProps } from "@chakra-ui/react";

import { THEME_COLORS } from "../../base/theme/foundations/colors";

interface StickyTableContainerProps extends Omit<TableContainerProps, "sx"> {
  children: React.ReactNode;
  variant?: "default" | "spaced";
}

export const StickyTableContainer: React.FC<StickyTableContainerProps> = ({
  children,
  variant = "default",
  height = "calc(100vh - 224px)",
  overflowX = "auto",
  overflowY = "auto",
  bgColor = THEME_COLORS.darkBlue[900],
  borderRadius = "8px",
  mb = 4,
  mt = 2,
  ...props
}) => {
  const getTableStyles = () => {
    const baseStyles = {
      "& thead": {
        position: "sticky",
        top: "-4px",
        zIndex: "docked",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
      "& thead th": {
        backgroundColor: THEME_COLORS.darkBlue2[900],
        borderBottom: `1px solid ${THEME_COLORS.darkBlue[800]}`,
        whiteSpace: "nowrap",
      },
    };

    if (variant === "spaced") {
      return {
        "& table": {
          borderCollapse: "separate",
          borderSpacing: "0 4px",
        },
        ...baseStyles,
      };
    }

    return {
      "& table": {
        borderCollapse: "collapse !important",
      },
      ...baseStyles,
      "& tbody tr": {
        borderBottom: `1px solid ${THEME_COLORS.darkBlue[800]}`,
      },
      "& tbody tr:hover": {
        backgroundColor: THEME_COLORS.darkBlue[800],
      },
    };
  };

  return (
    <TableContainer
      height={height}
      overflowX={overflowX}
      overflowY={overflowY}
      bgColor={bgColor}
      borderRadius={borderRadius}
      mb={mb}
      mt={mt}
      sx={getTableStyles()}
      {...props}
    >
      {children}
    </TableContainer>
  );
};
