import { Button } from "@chakra-ui/react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { StyledTabBar } from "../../components/StyledTabBar/StyledTabBar";
import { FiPlus } from "react-icons/fi";
import { MyGroupsTable } from "./components/MyGroupsTable";
import { AllGroupsTable } from "./components/AllGroupsTable";
import { useEffect, useState } from "react";

export const GroupsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") ?? "mygroups";
  const [selectedTab, setSelectedTab] = useState(initialTab);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const newTab = queryParams.get("tab") ?? "mygroups";
    if (selectedTab != newTab) {
      setSelectedTab(newTab);
    }
  }, [selectedTab, location.search]);

  const navigateToCreateGroup = () => {
    navigate("create");
  };

  const handleTabChange = (value: string) => {
    navigate(`?tab=${value}`);
  };

  const getTabList = () => {
    const tabs = [
      { value: "mygroups", label: "My groups" },
      { value: "allgroups", label: "All groups" },
    ];

    return tabs;
  };

  const getTabPanels = () => {
    const panels = [
      <MyGroupsTable viewType="normal" key={"mygroups"} />,
      <AllGroupsTable key={"allgroups"} />,
    ];

    return panels;
  };

  return (
    <>
      <StyledTabBar
        size="lg"
        tabList={getTabList()}
        selectedTab={selectedTab}
        onChange={handleTabChange}
        actionItems={
          import.meta.env.MODE === "production"
            ? []
            : [
                <Button
                  key={"create"}
                  leftIcon={<FiPlus />}
                  colorScheme="brandYellow"
                  onClick={navigateToCreateGroup}
                  variant="solid"
                  textColor="brandBlue.800"
                  fontWeight="700"
                >
                  New Group
                </Button>,
              ]
        }
        tabPanels={getTabPanels()}
      />
      <Outlet />
    </>
  );
};
