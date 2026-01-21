import { Box, Flex, Icon, useColorModeValue, Text, FlexProps } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { NavBarRoutes } from "../../base/router/routes";
import { NavLink } from "react-router-dom";

interface LinkItemProps {
  name?: string;
  path?: string;
  icon?: IconType;
}

const LinkItems: LinkItemProps[] = NavBarRoutes.map((page) => ({
  name: page?.title,
  path: page?.path,
  icon: page?.icon,
}));

export default function SideMenu() {
  return <Content />;
}

const Content = () => {
  return (
    <Box as="nav">
      {LinkItems.map((link) => (
        <NavItem key={link.name} path={link.path} icon={link.icon}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  icon?: IconType;
  path?: string;
  children?: string;
}

const NavItem = ({ icon, path, children, ...rest }: NavItemProps) => {
  return (
    <Box
      as={NavLink}
      to={{ pathname: path }}
      _hover={{ opacity: 1 }}
      _focus={{ boxShadow: "none" }}
      _activeLink={{ opacity: 1 }}
      flexDirection="row"
      color={useColorModeValue("white", "black")}
      opacity="0.5"
    >
      <Flex
        align="center"
        p="2"
        m="2"
        borderRadius="lg"
        cursor="pointer"
        flexDir={"column"}
        {...rest}
      >
        {icon && <Icon fontSize="1.5rem" mb="1" as={icon} color="currentColor" />}
        <Text color={useColorModeValue("white", "black")} fontSize="0.72rem">
          {children}
        </Text>
      </Flex>
    </Box>
  );
};
