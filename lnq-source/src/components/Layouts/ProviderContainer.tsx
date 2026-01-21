import { Outlet } from "react-router-dom";
import SideBar from "../SideBar/SideBar";
import { Box } from "@chakra-ui/react";

export const ProviderContainer = () => {
  return (
    <Box>
      <SideBar>
        <Outlet />
      </SideBar>
    </Box>
  );
};
