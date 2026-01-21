import { extendTheme, withDefaultProps } from "@chakra-ui/react";
import { THEME_COLORS } from "./foundations/colors";
import { THEME_FONTS } from "./foundations/fonts";
import { THEME_BREAKPOINTS } from "./foundations/breakpoints";
import { THEME_SIZES } from "./foundations/sizes";
import { THEME_BORDER_RADIUS } from "./foundations/borderRadius";
import { THEME_GLOBAL_STYLES } from "./foundations/styles";
import { THEME_COMPONENTS } from "./foundations/components";

export const theme = extendTheme(
  {
    colors: THEME_COLORS,
    breakpoints: THEME_BREAKPOINTS,
    styles: THEME_GLOBAL_STYLES,
    components: THEME_COMPONENTS,
    ...THEME_SIZES,
    ...THEME_FONTS,
    ...THEME_BORDER_RADIUS,
    layerStyles: {
      alt: {
        bg: "#F4F8FF !important",
        color: "#8E959E !important",
        fontWeight: 600,
      },
    },
    textStyles: {
      h5: {
        fontSize: "20px",
        fontWeight: 700,
        lineHeight: "28px",
        color: "white",
      },
      h4: {
        fontSize: "24px",
        fontWeight: 700,
        lineHeight: "28px",
        color: "white",
      },
      h3: {
        fontSize: "34px",
        fontWeight: 700,
        lineHeight: "38px",
        letterSpacing: "0.085px",
        color: "white",
      },
      smBold: {
        fontSize: "14px",
        fontWeight: 700,
        lineHeight: "18px",
        color: "white",
      },
      smMdSemi: {
        fontSize: "14px",
        fontWeight: 600,
        lineHeight: "18px",
        color: "white",
      },
      sm: {
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "18px",
        color: "white",
      },
      caption: {
        fontSize: "14px",
        fontWeight: 500,
        lineHeight: "16px",
        color: "white",
      },
      captionSemi: {
        fontSize: "12px",
        fontWeight: 600,
        lineHeight: "18px",
        color: "white",
      },
      bodyBold: {
        fontSize: "16px",
        fontWeight: 700,
        lineHeight: "24px",
        color: "white",
      },
      body: {
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: "24px",
        color: "white",
      },
      bodySemi: {
        fontSize: "16px",
        fontWeight: 600,
        lineHeight: "24px",
        color: "white",
      },
      tooltip: {
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: "18px",
        color: "white",
      },

      tiny: {
        fontSize: "10px",
        fontWeight: 400,
        lineHeight: "14px",
        color: "white",
      },
    },
  },
  // These are the default props used by all components
  withDefaultProps({
    defaultProps: {
      variant: "outline",
      size: "md",
      colorScheme: "primary",
    },
    components: ["Input", "NumberInput", "PinInput"],
  }),
  withDefaultProps({
    defaultProps: {
      variant: "solid",
      size: "md",
      colorScheme: "whiteAlpha",
    },
    components: ["Button", "Checkbox"],
  }),
);
