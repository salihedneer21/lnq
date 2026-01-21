import { baseTheme, theme } from "@chakra-ui/react";

export const THEME_GLOBAL_STYLES = {
  global: {
    "html, body": {
      fontFamily: "body",
      lineHeight: baseTheme.lineHeights.base,
      color: "gray.900",
      background: "white",
    },
    "p, h1, h2, h3, h4, h5, h6": {
      color: theme.colors.gray[900],
    },
  },
};
