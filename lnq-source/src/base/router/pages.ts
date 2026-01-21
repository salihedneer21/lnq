export const PUBLIC_PAGES = {
  index: "/",
  ormTest: "/orm-test",
};

export const AUTH_PAGES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  checkPassword: "/check-password",
  verifyPhone: "/verify-phone",
  temporaryPassword: "/temporary-password",
};

export const PASSWORD_TYPE = {
  invite: "invite",
  signup: "signup",
};

export const PROVIDER_PAGES = {
  profile: "/profile",
  home: "/home",
  completedStudies: "/completed-studies",
  resources: "/resources",
  rvuTracker: "/rvu-tracker",
  // Groups
  groups: "/groups",
  newGroup: "/create",
  overview: "/overview",
  editGroup: "/edit",
  viewGroup: "/view",
  schedule: "/schedule/:groupId?",
  // Stripe
  stripeNotConnected: "/stripe-not-connected",
  stripePayout: "/stripe-payout",
  // Settings
  settings: "/settings",
  changePassword: "/change-password",
};

export const ADMIN_PAGES = {
  overview: "/overview",
  groups: "/groups",
  providers: "/providers",
};
