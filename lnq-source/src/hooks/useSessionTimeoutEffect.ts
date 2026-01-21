import { useEffect } from "react";

import { useSignOut } from "../api/AuthApi";

/**
 * Will log the user out if time between sessions exceeds specified amount.
 * @param seconds Amount of time between visibility change events (visible vs hidden)
 * required for the user to be logged out.
 */
export const useSessionTimeoutEffect = (seconds: number) => {
  const { mutateAsync: signOut } = useSignOut();
  useEffect(() => {
    const checkForTimeout = () => {
      const sessionEndTime = globalThis.localStorage.getItem("session_end_time");
      if (sessionEndTime) {
        const now = Date.now();
        if (now - Number.parseInt(sessionEndTime) >= seconds * 1000) {
          signOut();
        }
      }
    };
    // Checks on initial app load
    checkForTimeout();
    // Checks every time the app is visible again
    const visibilityChanged = () => {
      if (document.visibilityState === "hidden") {
        globalThis.localStorage.setItem("session_end_time", `${Date.now()}`);
        return;
      }
      if (document.visibilityState === "visible") {
        checkForTimeout();
      }
    };
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
