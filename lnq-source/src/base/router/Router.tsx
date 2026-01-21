import { useCallback, useEffect } from "react";
import { IdleTimerProvider } from "react-idle-timer";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { useAccessToken, useSignOut } from "../../api/AuthApi";
import { useUserData } from "../../api/UserApi";
import { AdminContainer } from "../../components/Layouts/AdminContainer";
import { ProviderContainer } from "../../components/Layouts/ProviderContainer";
import useCometChatWidget from "../../hooks/useCometChatWidget";
import { useSessionTimeoutEffect } from "../../hooks/useSessionTimeoutEffect";
import ErrorWrapperPage from "../../pages/_ErrorWrapperPage/ErrorWrapperPage";
import { GroupLayout } from "../../pages/GroupsPage/GroupLayout";
import ProviderProfilePage from "../../pages/GroupsPage/ProviderProfilePage";
import { PublicGroupViewPage } from "../../pages/GroupsPage/PublicGroupViewPage";
import { useGlobalStore } from "../../store/globalStore";
import { PROVIDER_PAGES } from "./pages";
import { RouteComponent } from "./RouteComponent";
import { NavBarRoutes, PROTECTED_ROUTES, PUBLIC_ROUTES, SideBarRoutes } from "./routes";

export const AppRoutes = (): JSX.Element => {
  useCometChatWidget();
  const { isLoading: isUserLoading } = useUserData();
  const setIsLoading = useGlobalStore((state) => state.setIsLoading);
  const { isLoading: isAccessTokenLoading } = useAccessToken();
  const { mutateAsync: signOut } = useSignOut();
  const SESSION_TIMEOUT_SECONDS = 60 * 120; // 2 hours

  useEffect(() => {
    setIsLoading(Boolean(isUserLoading || isAccessTokenLoading));
  }, [isAccessTokenLoading, isUserLoading, setIsLoading]);

  useSessionTimeoutEffect(SESSION_TIMEOUT_SECONDS);
  const onIdle = useCallback(() => {
    if (import.meta.env.MODE !== "development") {
      signOut();
    }
  }, [signOut]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route ErrorBoundary={ErrorWrapperPage}>
        <Route element={<AdminContainer />}>
          <Route
            path={PROVIDER_PAGES.home}
            element={<RouteComponent {...NavBarRoutes[0]} />}
          />
          <Route path={PROVIDER_PAGES.groups} element={<GroupLayout />}>
            <Route index element={<RouteComponent {...NavBarRoutes[1]} />} />
            {import.meta.env.MODE !== "production" ? (
              <Route
                path={"create"}
                element={<RouteComponent {...NavBarRoutes[1].nestedRoutes![0]} />}
              />
            ) : null}
            <Route
              path={"overview" + "/:groupId"}
              element={<RouteComponent {...NavBarRoutes[1].nestedRoutes![1]} />}
            />
            <Route
              path={"edit" + "/:groupId"}
              element={<RouteComponent {...NavBarRoutes[1].nestedRoutes![2]} />}
            />
            <Route path={"view" + "/:groupId"} element={<PublicGroupViewPage />} />
            <Route path={"provider/:providerId"} element={<ProviderProfilePage />} />
          </Route>
          <Route
            path={PROVIDER_PAGES.rvuTracker}
            element={<RouteComponent {...NavBarRoutes[2]} />}
          />
          <Route
            path={PROVIDER_PAGES.completedStudies}
            element={<RouteComponent {...NavBarRoutes[3]} />}
          />
          <Route
            path={PROVIDER_PAGES.schedule}
            element={<RouteComponent {...NavBarRoutes[4]} />}
          />
          <Route
            path={PROVIDER_PAGES.resources}
            element={<RouteComponent {...NavBarRoutes[5]} />}
          />
          <Route
            path={PROVIDER_PAGES.settings}
            element={<RouteComponent {...NavBarRoutes[6]} />}
          />
          <Route path="/contact" element={<RouteComponent {...NavBarRoutes[7]} />} />

          <Route
            path={PROVIDER_PAGES.stripeNotConnected}
            element={<RouteComponent {...PROTECTED_ROUTES[0]} />}
          />
          <Route
            path={PROVIDER_PAGES.stripePayout}
            element={<RouteComponent {...PROTECTED_ROUTES[1]} />}
          />
        </Route>
        <Route
          path={PROVIDER_PAGES.changePassword}
          element={<RouteComponent {...PROTECTED_ROUTES[2]} />}
        />
        <Route element={<ProviderContainer />}>
          {SideBarRoutes.map((route, index) => (
            <Route
              key={index + route.path}
              path={route.path}
              element={<RouteComponent {...route} key={index} />}
            />
          ))}
        </Route>
        {PUBLIC_ROUTES.filter(
          (route) =>
            (route.type === "development" && import.meta.env.MODE !== "production") ||
            route.type !== "development",
        ).map((route, index) => (
          <Route
            key={index + route.path}
            path={route.path}
            element={<RouteComponent {...route} key={index} />}
          />
        ))}
      </Route>,
    ),
  );

  return (
    <IdleTimerProvider timeout={SESSION_TIMEOUT_SECONDS * 1000} onIdle={onIdle}>
      <RouterProvider router={router} />
    </IdleTimerProvider>
  );
};
