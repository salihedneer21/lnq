// import { Theme } from "@chakra-ui/react";

import { StyleFunctionProps, Theme } from "@chakra-ui/react";

const activeLabelStyles = {
  transform: "scale(0.85) translateY(-30px)",
};

// export const THEME_COMPONENTS: Theme["components"] = {
export const THEME_COMPONENTS = {
  Input: {
    defaultProps: {
      errorBorderColor: "error.400",
    },
  },
  Form: {
    variants: {
      floating: {
        container: {
          _focusWithin: {
            label: {
              ...activeLabelStyles,
            },
          },
          "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label":
            {
              ...activeLabelStyles,
            },
          label: {
            top: 0,
            left: 0,
            zIndex: 2,
            position: "absolute",
            backgroundColor: "white",
            pointerEvents: "none",
            mx: 3,
            px: 1,
            my: 4,
            transformOrigin: "left top",
            color: "gray.400",
            fontWeight: "normal",
          },
          input: {
            height: "56px",
          },
        },
      },
    },
    parts: [],
  },
  Tabs: {
    variants: {
      line: {
        tab: {
          _selected: {
            color: "brandBlue.800",
            borderBottom: "2px solid",
            borderColor: "brandBlue.800",
          },
          color: "gray.500",
          fontWeight: 700,
        },
        tablist: {
          borderBottom: "0px solid",
        },
        tabpanel: {
          padding: 0,
        },
      },
    },
    sizes: {
      md: {
        tab: {
          fontSize: "14px",
          lineHeight: "28px",
          textTransform: "uppercase",
          paddingBottom: "4px",
        },
        tablist: {
          borderBottom: "1px solid",
        },
      },
      lg: {
        tab: {
          paddingBottom: "4px",
        },
      },
    },
  },
  Checkbox: {
    variants: {},
    baseStyle: (props: StyleFunctionProps) => ({
      container: {
        _disabled: {
          bg: "transparent",
          borderColor: "gray.400",
          cursor: "auto",
        },
      },
      control: {
        width: "18px",
        height: "18px",
        borderRadius: "4px",
        border: "1px solid",
        borderColor: "gray.400",
        _checked: {
          bg: "transparent",
          _hover: {
            bg: "transparent",
          },
          _disabled: {
            bg: "transparent",
            borderColor: "gray.400",
            display: "none",
          },
        },
        _disabled: {
          bg: "transparent",
          borderColor: "gray.400",
        },
        _indeterminate: {
          bg: "transparent",
          borderColor: "gray.400",
        },
      },
      icon: {
        height: "16px",
        width: "16px",
        color: (props.theme as Theme).colors[
          props.colorScheme as keyof Theme["colors"]
        ][600],
      },
      label: {
        _disabled: {
          ml: "0",
          opacity: 1,
          cursor: "auto",
        },
      },
    }),
    parts: ["control", "icon"],
  },
  Table: {
    variants: {
      unstyled: {
        th: {
          color: "gray.500",
        },
        td: {
          "&:first-of-type": {
            borderRadius: `8px 0px 0px 8px`,
          },
          "&:last-child": {
            borderRadius: "0px 8px 8px 0px",
          },
        },
      },
    },

    baseStyle: {
      table: {
        width: "100%",
        border: "none",
        borderCollapse: "separate !important",
        borderSpacing: " 0 4px",
      },
    },
    sizes: {
      sm: {
        th: {
          textTransform: "unset",
          ml: 15,
          color: "gray.600",
          pl: "3",
          pr: "3",
          py: "1",
          verticalAlign: "bottom",
        },
        td: {
          textAlign: "left",
          // fontSize: "lg",
          // color: "gray.600",
          textStyle: "smBold",
          pl: "3",
          pr: "3",
          py: "1",
          "&:first-of-type": {
            borderRadius: `8px 0px 0px 8px`,
          },
          "&:last-child": {
            borderRadius: "0px 8px 8px 0px",
          },
        },
        tr: {
          mx: "0.25",
          mb: "0.25",
        },
      },
      xs: {
        th: {
          textTransform: "unset",
          ml: 15,
          fontSize: "x-small",
          color: "gray.600",
          pl: "3",
          pr: "3",
          verticalAlign: "bottom",
        },
        td: {
          textAlign: "left",
          textStyle: "smBold",
          lineHeight: 1,
          height: "18px",
          pl: "3",
          pr: "3",
          py: "0",
          "& > p": {
            lineHeight: 1,
          },
          "&:first-of-type": {
            borderRadius: `8px 0px 0px 8px`,
          },
          "&:last-child": {
            borderRadius: "0px 8px 8px 0px",
          },
        },
        tr: {
          mx: "0.25",
          mb: "0px",
        },
      },
    },
  },
};
