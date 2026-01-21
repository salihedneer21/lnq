import { loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { EnvConfig } from "../base/EnvConfig";
import { THEME_COLORS } from "../base/theme/foundations/colors";

export const stripeClient = loadStripe(EnvConfig.VITE_STRIPE_PUBLIC_KEY) as Promise<Stripe>;

export const stripeOptions: StripeElementsOptions = {
  mode: "setup",
  currency: "usd",
  loader: "auto",
  appearance: {
    theme: "night",
    labels: "floating",
    variables: {
      colorPrimary: THEME_COLORS.brandYellow[400],
      colorBackground: THEME_COLORS.darkBlue2[800],
      colorText: "white",
      colorSuccess: THEME_COLORS.brandYellow[800],
      colorTextPlaceholder: THEME_COLORS.gray[400],
    },
    rules: {
      ".Input, .CheckboxInput, .CodeInput": {
        transition: "none",
        borderColor: "var(--colorPrimary)",
      },
    },
  },
};
