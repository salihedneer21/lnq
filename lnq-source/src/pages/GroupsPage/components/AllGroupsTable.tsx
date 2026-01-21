import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllGroups, useGetMyGroups, useRequestGroup } from "../../../api/GroupApi";
import { Box, Button, HStack, Image, Td, Text } from "@chakra-ui/react";
import { assetIcons } from "../../../constants/icons";
import { StyledTable } from "../../../components/StyledTable/StyledTable";
import { Pagination } from "../../../components/Pagination/Pagination";
import { AllGroupResponse, Status } from "../../../types/GroupResponse";
import { phoneNumberFormatter } from "~/components/EventsCalendar/utils";
import { PROVIDER_PAGES } from "../../../base/router/pages";
import { RVUValue } from "../../../components/RVUValue";

export const AllGroupsTable = () => {
  const navigate = useNavigate();
  const { mutate: requestGroup, isPending: isRequestingGroup } = useRequestGroup();
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const { data: groupsData, isLoading: isGettingAllGroups } = useGetAllGroups(
    page,
    perPage,
  );
  const { data: myGroupsData, isLoading: isMyGroupLoading } = useGetMyGroups(1, 0);

  useEffect(() => {
    if (groupsData?.currentPage) {
      setPage(groupsData?.currentPage);
    }
  }, [groupsData?.currentPage]);

  const tableColumns = [
    { key: "facility", label: "Facility" },
    { key: "providers", label: "Providers" },
    { key: "phone", label: "Phone Number" },
    { key: "description", label: "Description" },
    { key: "usdPerRvuHigh", label: "Highest $/RVU" },
    { key: "usdPerRvuLow", label: "Lowest $/RVU" },
    { key: "usdPerRvuRecent", label: "Recent $/RVU" },
    { key: "actions", label: "" },
  ];

  const requestToJoin = (id: string) => {
    requestGroup(id);
  };

  const handleRowClick = (row: AllGroupResponse) => {
    navigate(`${PROVIDER_PAGES.groups}/view/${row.id}`);
  };

  const groupRow = (row: AllGroupResponse) => {
    let highRvuValue: string;
    let lowRvuValue: string;
    let recentRvuValue: string;

    if (!row.rvuRateVisible) {
      highRvuValue = "TBD";
      lowRvuValue = "TBD";
      recentRvuValue = "TBD";
    } else {
      highRvuValue = row.usdPerRvuHigh ? `$${row.usdPerRvuHigh}` : "N/A";
      lowRvuValue = row.usdPerRvuLow ? `$${row.usdPerRvuLow}` : "N/A";
      recentRvuValue = row.usdPerRvuRecent ? `$${row.usdPerRvuRecent}` : "N/A";
    }

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
          <Text textStyle="smMdSemi">{phoneNumberFormatter(row?.phone)}</Text>
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
        <Td>
          <RVUValue textStyle={"smMdSemi"} displayValue={highRvuValue} />
        </Td>
        <Td>
          <RVUValue textStyle={"smMdSemi"} displayValue={lowRvuValue} />
        </Td>
        <Td>
          <RVUValue textStyle={"smMdSemi"} displayValue={recentRvuValue} />
        </Td>
        <Td style={{ maxWidth: "20vw" }}>
          {row.userStatusInGroup === Status.PENDING ? (
            <Button variant="outline" size="sm" isDisabled>
              Pending...
            </Button>
          ) : null}
          {row.userStatusInGroup === Status.ACCEPTED ? (
            <Button variant="outline" size="sm" isDisabled>
              Joined
            </Button>
          ) : null}
          {row.userStatusInGroup === null ? (
            <Button
              variant="outline"
              size="sm"
              color="white"
              isLoading={isRequestingGroup}
              onClick={() => void requestToJoin(row.id)}
            >
              Request to join
            </Button>
          ) : null}
        </Td>
      </>
    );
  };

  return (
    <Box>
      {(myGroupsData?.docs?.length ?? 0) === 0 && !isMyGroupLoading && (
        <Text fontSize={18} fontWeight="700" color="white" mt={6}>
          Welcome to LnQ. To get started make sure to join at least one group.
        </Text>
      )}
      <StyledTable
        columns={tableColumns}
        customRowRenderers={groupRow}
        data={groupsData?.docs ?? []}
        loading={isGettingAllGroups}
        onClickRow={handleRowClick}
      />
      <Pagination
        pages={groupsData?.totalPages ?? 0}
        currentPage={page}
        setPage={setPage}
      />
    </Box>
  );
};
