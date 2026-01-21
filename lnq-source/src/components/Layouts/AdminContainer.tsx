import { Grid, GridItem, useColorModeValue } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import SideMenu from "../SideMenu/SideMenu";

export const AdminContainer = () => {
  return (
    <Grid
      bg={useColorModeValue("brandBlue.800", "brandBlue.800")}
      templateAreas={`
        "header header"
        "nav main"
      `}
      gridTemplateRows={"5rem 1fr"}
      gridTemplateColumns={"5rem 1fr"}
      h="100%"
    >
      <GridItem area={"header"} justifyContent="center">
        <NavBar />
      </GridItem>
      <GridItem pt="5rem" area={"nav"}>
        <SideMenu />
      </GridItem>
      <GridItem
        pt="3rem"
        px="2rem"
        pb="2rem"
        borderTopLeftRadius={25}
        backgroundColor={useColorModeValue("darkBlue.900", "darkBlue.900")}
        area={"main"}
        overflowY="scroll"
      >
        <Outlet />
      </GridItem>
    </Grid>
  );
};
