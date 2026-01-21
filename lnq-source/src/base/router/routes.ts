/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ADMIN_PAGES, AUTH_PAGES, PROVIDER_PAGES, PUBLIC_PAGES } from "./pages.ts";
import HomePage from "../../pages/HomePage/HomePage";
import LoginPage from "../../pages/_AuthPages/LoginPage/LoginPage";
import RegisterPage from "../../pages/_AuthPages/RegisterPage/RegisterPage";
import ForgotPasswordPage from "../../pages/_AuthPages/ForgotPasswordPage/ForgotPasswordPage";
import { FiSettings, FiUsers } from "react-icons/fi";
import {
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineChartSquareBar,
  HiOutlineCog,
  HiOutlineHome,
  HiOutlinePencilAlt,
  HiOutlineUserGroup,
  HiOutlineQuestionMarkCircle,
} from "react-icons/hi";
import { IconType } from "react-icons";
import { GroupsPage } from "../../pages/GroupsPage/GroupsPage";
import { SettingsPage } from "../../pages/SettingsPage/SettingsPage";
import { CompletedStudiesPage } from "../../pages/CompletedStudiesPage/CompletedStudiesPage";
import { CheckPasswordPage } from "../../pages/_AuthPages/CheckPasswordPage/CheckPasswordPage";
import VerifyPhonePage from "../../pages/_AuthPages/VerifyPhonePage/VerifyPhonePage";
import { CreateGroupPage } from "../../pages/GroupsPage/CreateGroupPage";
import { GroupDetailsPage } from "../../pages/GroupsPage/GroupDetailsPage";
import { EditGroupPage } from "../../pages/GroupsPage/EditGroupPage";
import { OrmTestPage } from "../../pages/OrmTestPage/OrmTestPage";
import { StripeNotConnectPage } from "../../pages/PaymentsPage/StripeNotConnectPage";
import { PayNowPage } from "../../pages/PaymentsPage/PayNowPage";
import ResourcesPage from "../../pages/ResourcesPage/ResourcesPage";
import ChangePasswordPage from "../../pages/ChangePasswordPage/ChangePasswordPage";
import RVUTrackerPage from "../../pages/RVUTracker/RVUTrackerPage";
import { SchedulePage } from "../../pages/SchedulePage/SchedulePage";

import QuestionnaireForm from "../../pages/_AuthPages/Questionnaire/QuestionnaireForm.tsx";
import TemporaryPasswordChangePage from "../../pages/_AuthPages/TemporaryPasswordChangePage/TemporaryPasswordChangePage.tsx";
import { ContactWrapper } from "../../pages/ContactPage/ContactWrapper";

export interface RouteType {
  path: string;
  title?: string;
  icon?: IconType;
  nestedRoutes?: RouteType[];
  component: any;
  type: "public" | "auth" | "protected" | "development" | "blocking";
}

export const NavBarRoutes: RouteType[] = [
  {
    path: PROVIDER_PAGES.home,
    title: "Home",
    component: HomePage,
    type: "protected",
    icon: HiOutlineHome,
  },
  {
    path: PROVIDER_PAGES.groups,
    title: "Groups",
    component: GroupsPage,
    type: "protected",
    icon: HiOutlineUserGroup,
    nestedRoutes: [
      {
        path: PROVIDER_PAGES.newGroup,
        title: "New Group",
        component: CreateGroupPage,
        type: "protected",
      },
      {
        path: PROVIDER_PAGES.groups,
        title: "Overview",
        component: GroupDetailsPage,
        type: "protected",
      },
      {
        path: PROVIDER_PAGES.editGroup,
        title: "Edit Group",
        component: EditGroupPage,
        type: "protected",
      },
    ],
  },
  {
    path: PROVIDER_PAGES.rvuTracker,
    title: "Tracker",
    component: RVUTrackerPage,
    type: "protected",
    icon: HiOutlineChartSquareBar,
  },
  {
    path: PROVIDER_PAGES.completedStudies,
    title: "Studies",
    component: CompletedStudiesPage,
    type: "protected",
    icon: HiOutlineBriefcase,
  },
  {
    path: PROVIDER_PAGES.schedule?.replace("/:groupId?", "/"),
    title: "Schedule",
    component: SchedulePage,
    type: "protected",
    icon: HiOutlineCalendar,
  },
  {
    path: PROVIDER_PAGES.resources,
    title: "Resources",
    component: ResourcesPage,
    type: "protected",
    icon: HiOutlinePencilAlt,
  },
  {
    path: PROVIDER_PAGES.settings,
    title: "Settings",
    component: SettingsPage,
    type: "protected",
    icon: HiOutlineCog,
  },
  {
    path: "/contact",
    title: "Contact",
    component: ContactWrapper,
    type: "protected",
    icon: HiOutlineQuestionMarkCircle,
  },
];

export const SideBarRoutes: RouteType[] = [
  {
    path: ADMIN_PAGES.groups,
    title: "Groups",
    component: GroupsPage,
    type: "protected",
    icon: FiUsers,
  },
  {
    path: PROVIDER_PAGES.settings,
    title: "Settings",
    component: SettingsPage,
    type: "protected",
    icon: FiSettings,
  },
];

export const PUBLIC_ROUTES: RouteType[] = [
  {
    path: "/",
    title: "LnQ",
    component: LoginPage,
    type: "auth",
  },
  {
    path: AUTH_PAGES.register,
    title: "Register",
    component: RegisterPage,
    type: "auth",
  },
  {
    path: AUTH_PAGES.login,
    title: "Login",
    component: LoginPage,
    type: "auth",
  },
  {
    path: AUTH_PAGES.forgotPassword,
    title: "Forgot Password",
    component: ForgotPasswordPage,
    type: "auth",
  },
  {
    path: AUTH_PAGES.checkPassword + "/:type",
    title: "Check Password",
    component: CheckPasswordPage,
    type: "auth",
  },
  {
    path: AUTH_PAGES.verifyPhone,
    title: "Verify Phone",
    component: VerifyPhonePage,
    type: "auth",
  },
  {
    path: PUBLIC_PAGES.ormTest,
    title: "ORM Test",
    component: OrmTestPage,
    type: "development",
  },
  {
    path: "/questionnaire",
    title: "Questionnaire",
    component: QuestionnaireForm,
    type: "public",
  },
  {
    path: AUTH_PAGES.temporaryPassword,
    title: "Change Temporary Password",
    component: TemporaryPasswordChangePage,
    type: "auth",
  },
];

export const PROTECTED_ROUTES: RouteType[] = [
  {
    path: PROVIDER_PAGES.stripeNotConnected,
    title: "Stripe Not Connected",
    component: StripeNotConnectPage,
    type: "protected",
  },
  {
    path: PROVIDER_PAGES.stripePayout,
    title: "Pay Now",
    component: PayNowPage,
    type: "protected",
  },
  {
    path: PROVIDER_PAGES.changePassword,
    title: "Change Password",
    component: ChangePasswordPage,
    type: "blocking",
  },
];
