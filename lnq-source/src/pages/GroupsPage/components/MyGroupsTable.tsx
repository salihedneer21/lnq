import { useEffect, useMemo, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import {
  Box,
  HStack,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Td,
  Text,
} from "@chakra-ui/react";

import { useGetMyGroups } from "../../../api/GroupApi";
import { PROVIDER_PAGES } from "../../../base/router/pages";
import { Pagination } from "../../../components/Pagination/Pagination";
import { StyledTable } from "../../../components/StyledTable/StyledTable";
import UserHasNoGroup from "../../../components/UserHasNoGroups/UserHasNoGroup.tsx";
import { assetIcons } from "../../../constants/icons";
import { MyGroupResponse } from "../../../types/GroupResponse";
import { phoneNumberFormatter } from "~/components/EventsCalendar/utils.ts";

interface Props {
  viewType: "admin" | "normal";
}

export const MyGroupsTable = ({ viewType }: Props) => {
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const { data: myGroupsData, isLoading: isGettingMyGroups } = useGetMyGroups(
    page,
    perPage,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (myGroupsData?.currentPage) {
      setPage(myGroupsData.currentPage);
    }
  }, [myGroupsData?.currentPage]);

  const navigateToOverview = (row: MyGroupResponse) => {
    navigate(`${PROVIDER_PAGES.groups}/overview/${row.id}`);
  };
  const navigateToEditGroup = (row: MyGroupResponse) => {
    navigate(`${PROVIDER_PAGES.groups}/edit/${row.id}`);
  };

  const tableColumns = [
    { key: "facility", label: "Facility" },
    { key: "providers", label: "Providers" },
    { key: "phone", label: "Phone Number" },
    { key: "description", label: "Description" },
    { key: "actions", label: "" },
  ];

  const groupsData = useMemo(
    () =>
      myGroupsData?.docs?.map((group) => {
        return {
          ...group,
          facility: group.facilityName,
          providers: group.groupProvidersCount,
        };
      }),
    [myGroupsData?.docs],
  );

  const groupRow = (row: MyGroupResponse) => {
    return (
      <>
        <Td>
          <Text textStyle={"smMdSemi"}>{row.facilityName}</Text>
        </Td>
        <Td>
          <HStack>
            <Image src={assetIcons.userOutline} />
            <Text textStyle={"smBold"}>{row.groupProvidersCount}</Text>
          </HStack>
        </Td>
        <Td>
          <Text textStyle="smMdSemi">
            {row.phone ? `${phoneNumberFormatter(row?.phone)}` : "-"}
          </Text>
        </Td>
        <Td style={{ maxWidth: "20vw" }}>
          <Text
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
            textStyle="caption"
          >
            {row.description}
          </Text>
        </Td>
        <Td style={{ maxWidth: "20vw" }}>
          <HStack justify={"flex-end"}>
            {viewType === "admin" && row.isAdmin && (
              <Menu isLazy autoSelect={false}>
                <MenuButton onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    as="span"
                    variant={"ghost"}
                    icon={<BiDotsVerticalRounded />}
                    aria-label={"Facility Action"}
                  />
                </MenuButton>
                <MenuList
                  p="16px"
                  borderRadius={16}
                  bgColor="darkBlue2.800"
                  border="none"
                  maxHeight="200px"
                  overflowY="auto"
                >
                  <MenuItem
                    bgColor="darkBlue2.800"
                    color="white"
                    paddingY="16px"
                    fontWeight="600"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToEditGroup(row);
                    }}
                  >
                    Edit Group
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>
        </Td>
      </>
    );
  };

  if (!isGettingMyGroups && (!groupsData || groupsData.length === 0)) {
    return <UserHasNoGroup />;
  }

  return (
    <Box>
      <StyledTable
        columns={tableColumns}
        customRowRenderers={groupRow}
        data={groupsData ?? []}
        loading={isGettingMyGroups}
        onClickRow={navigateToOverview}
      />
      <Pagination
        pages={myGroupsData?.totalPages ?? 0}
        currentPage={page}
        setPage={setPage}
      />
    </Box>
  );
};
