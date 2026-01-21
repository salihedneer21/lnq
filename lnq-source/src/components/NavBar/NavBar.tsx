import {
  Box,
  Flex,
  Stack,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Avatar,
} from "@chakra-ui/react";
import { Logo } from "../Logo";
import PayOutButton from "../PayOutButton";
import { useSignOut } from "../../api/AuthApi";
import CodeYellowStatusLabel from "../CodeYellowStatusLabel.tsx";
import { HiOutlineUserCircle } from "react-icons/hi";
import NavSyncWarning from "./NavSyncWarning.tsx";
import { useGetUserHasPersonalActiveLnQ } from "~/api/CodeYellowApi.ts";

export default function NavBar() {
  const { mutate: signOut } = useSignOut();
  const { data } = useGetUserHasPersonalActiveLnQ();
  return (
    <Box height="100%">
      <Flex
        bg={useColorModeValue("brandBlue.800", "brandBlue.800")}
        color={useColorModeValue("gray.600", "white")}
        w="100%"
        px="1rem"
        h="100%"
        align={"center"}
      >
        <Flex flex={{ base: 2 }} justify={{ base: "start" }} mr="2">
          <Logo objectFit="contain" minW="10rem" align={"left"} h="3rem" variant="small" />
        </Flex>
        <Stack justifyContent="flex-end" alignItems="center" direction="row" spacing={2}>
          <NavSyncWarning />
          <Menu>
            <MenuButton>
              <Avatar
                h="2rem"
                w="2rem"
                bg="transparent"
                icon={<HiOutlineUserCircle fontSize="2rem" />}
              />
            </MenuButton>
            <MenuList
              minW="fit-content"
              px="16px"
              borderRadius={16}
              bgColor="darkBlue2.800"
              border="none"
            >
              <MenuItem
                bgColor="darkBlue2.800"
                color="white"
                paddingY="16px"
                fontWeight="600"
              >
                <Button as="span" variant={"link"} onClick={() => signOut()} color="white">
                  Sign out
                </Button>
              </MenuItem>
            </MenuList>
          </Menu>

          <HStack spacing={2}>
            {data?.hasPersonalActiveLnQ ? <CodeYellowStatusLabel isActive isSmall /> : null}
          </HStack>

          <PayOutButton />
        </Stack>
      </Flex>
    </Box>
  );
}
