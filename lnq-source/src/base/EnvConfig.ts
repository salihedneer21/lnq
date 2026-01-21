interface ConfigType {
  APP_TITLE: string;
  BACKEND_BASE_URL: string;
  VITE_SENTRY_DNS: string;
  VITE_SENTRY_ENVIRONMENT: string;
  VITE_COMET_CHAT_REGION: string;
  VITE_COMET_CHAT_APP_ID: string;
  VITE_COMET_CHAT_AUTH_KEY: string;
  VITE_COMET_WIDGET_ID: string;
  VITE_API_KEY: string;
  VITE_STRIPE_PUBLIC_KEY: string;
}

export const EnvConfig: ConfigType = {
  APP_TITLE: import.meta.env.VITE_APP_TITLE as string,
  BACKEND_BASE_URL: import.meta.env.VITE_BACKEND_BASE_URL as string,
  VITE_COMET_CHAT_REGION: import.meta.env.VITE_COMET_CHAT_REGION as string,
  VITE_COMET_CHAT_APP_ID: import.meta.env.VITE_COMET_CHAT_APP_ID as string,
  VITE_COMET_CHAT_AUTH_KEY: import.meta.env.VITE_COMET_CHAT_AUTH_KEY as string,
  VITE_COMET_WIDGET_ID: import.meta.env.VITE_COMET_WIDGET_ID as string,
  VITE_API_KEY: import.meta.env.VITE_API_KEY as string,
  VITE_STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY as string,
  VITE_SENTRY_DNS: import.meta.env.VITE_SENTRY_DNS as string,
  VITE_SENTRY_ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT as string,
};
