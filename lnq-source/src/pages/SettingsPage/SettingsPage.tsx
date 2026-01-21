import { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { StyledTabBar } from "../../components/StyledTabBar/StyledTabBar";
import GeneralTab from "./components/GeneralTab";
import SecurityTab from "./components/SecurityTab";
import NotificationsTab from "./components/NotificationsTab";
import { ContactPage } from "../ContactPage/ContactPage";

export const SettingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentTab = useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    return tab ?? "general";
  }, [location.search]);

  const [selectedTab, setSelectedTab] = useState(getCurrentTab());

  useEffect(() => {
    setSelectedTab(getCurrentTab());
  }, [getCurrentTab, location.search]);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);

    const searchParams = new URLSearchParams(location.search);
    searchParams.set("tab", value);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  return (
    <StyledTabBar
      size="md"
      selectedTab={selectedTab}
      onChange={handleTabChange}
      tabList={[
        { value: "general", label: "General" },
        { value: "security", label: "Security" },
        { value: "notifications", label: "Notifications" },
        { value: "contact", label: "Contact Us" },
      ]}
      tabPanels={[
        <GeneralTab key="general" />,
        <SecurityTab key="security" />,
        <NotificationsTab key="notifications" />,
        <ContactPage key="contact" />,
      ]}
    />
  );
};
