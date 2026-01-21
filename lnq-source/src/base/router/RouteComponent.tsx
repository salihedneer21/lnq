import { Navigate } from "react-router-dom";
import { useGlobalSelectors } from "../../store/globalStore";
import { RouteType } from "./routes";
import { ADMIN_PAGES, AUTH_PAGES, PROVIDER_PAGES } from "./pages";
import { FullPageLoader } from "../../components/FullPageLoader";
import { Helmet } from "react-helmet-async";
import { AccountStatus, UserRoleType } from "../../types/CurrentUser";
import { useUserData } from "../../api/UserApi";
import { useAccessToken } from "../../api/AuthApi";

export const RouteComponent = ({
  component: PageComponent,
  type,
  title,
}: RouteType): JSX.Element => {
  const { data: currentUser } = useUserData();
  const { data: accessToken, isFetched } = useAccessToken();
  const isLoading = useGlobalSelectors.use.isLoading();

  // This preserves the url state on refresh, since accessToken will be undefined temporarily
  if (!isFetched) {
    return <PageComponent />;
  }

  if (type === "auth" && currentUser) {
    return (
      <Navigate
        to={
          currentUser.role === UserRoleType.ADMIN
            ? ADMIN_PAGES.overview
            : PROVIDER_PAGES.home
        }
        replace
      />
    );
  }

  if ((type === "protected" || type === "blocking") && (!currentUser || !accessToken)) {
    return <Navigate to={AUTH_PAGES.login} replace />;
  }

  if (
    type === "protected" &&
    currentUser &&
    currentUser.accountStatus === AccountStatus.NEEDS_PASSWORD_UPDATE
  ) {
    return <Navigate to={PROVIDER_PAGES.changePassword} replace />;
  }

  return (
    <>
      {title && (
        <Helmet>
          <title>{title}</title>
        </Helmet>
      )}
      {type === "protected" && isLoading && <FullPageLoader />}
      <PageComponent />
    </>
  );
};
