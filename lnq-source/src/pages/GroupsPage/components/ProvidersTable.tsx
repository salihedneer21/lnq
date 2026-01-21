import debounce from "lodash/debounce";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Td,
  Text,
  useToast,
  Th,
} from "@chakra-ui/react";

import {
  useAcceptGroupRequest,
  useGetProvidersInGroup,
  useRemoveUserFromGroup,
  useSetGroupProviderFixedUsdPerRvu,
  useSetGroupProviderLnqEnabled,
  useSetGroupProviderPayoutEnabled,
  useSetGroupProviderRole,
  useSetGroupProviderTargetingEnabled,
  useSetGroupRVUTackerOptIn,
  useSetGroupRVUTrackerVisibility,
} from "~/api/GroupApi";
import { useSearchProviders } from "~/api/GroupProviderApi";
import { useUserData } from "~/api/UserApi";
import { THEME_COLORS } from "~/base/theme/foundations/colors";
import { Pagination } from "~/components/Pagination/Pagination";
import CustomSelect from "~/components/Select/Select";
import { StyledTable, StickyTableContainer } from "~/components/StyledTable";
import { SortableHeader } from "~/components/SortableHeader";
import Switch from "~/components/Switch/Switch";
import { assetIcons } from "~/constants/icons";
import { Group, GroupProvider } from "~/types/Group";

import ProvidersTableRowMenu from "./ProvidersTableRowMenu";
import { SearchInput } from "./SearchInput";

type RVUTrackerVisibility = "view_all" | "view_self" | "none";

interface EnhancedGroupProvider extends GroupProvider {
  provider: string;
  isAvailable: boolean;
  available: string;
  status: string;
}

interface Props {
  group: Group;
  isGroupAdmin: boolean;
}

export const ProvidersTable = ({ group, isGroupAdmin }: Props) => {
  const { data: currentUser } = useUserData();
  const [perPage] = useState(30);
  const [page, setPage] = useState(1);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("ASC");
  const [sortKey, setSortKey] = useState(0);

  const { data, isLoading: isGettingProvidersInGroup } = useGetProvidersInGroup(
    group.id,
    page,
    perPage,
    {
      sortBy,
      sortDirection,
      sortKey,
    },
  );
  const { mutate: acceptGroupRequest, isPending: isAcceptingGroupRequest } =
    useAcceptGroupRequest();
  const { mutate: removeUserFromGroup, isPending: isRemovingUserFromGroup } =
    useRemoveUserFromGroup();
  const { mutate: setGroupProviderRole } = useSetGroupProviderRole();
  const { mutate: setGroupRVUTackerOptIn } = useSetGroupRVUTackerOptIn();
  const { mutate: setGroupProviderPayoutEnabled } = useSetGroupProviderPayoutEnabled();
  const { mutate: setGroupProviderTargetingEnabled } =
    useSetGroupProviderTargetingEnabled();
  const { mutate: setGroupProviderLnqEnabled } = useSetGroupProviderLnqEnabled();
  const { mutate: setGroupRVUTrackerVisibility } = useSetGroupRVUTrackerVisibility();
  const { mutate: setGroupProviderFixedUsdPerRvu } = useSetGroupProviderFixedUsdPerRvu();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const searchQueryResult = useSearchProviders(group.id, searchQuery);
  const searchResults = searchQueryResult.data;
  const isSearchingProviders = searchQueryResult.isLoading;
  const searchError = searchQueryResult.error;

  const handleSort = useCallback((sortKey: string, direction: "ASC" | "DESC") => {
    setSortBy(sortKey);
    setSortDirection(direction);
    setPage(1);
    setSortKey((prev) => prev + 1);
  }, []);

  const groupProviders = data?.providers;
  const paginationInfo = data
    ? `Showing ${(page - 1) * perPage + 1}-${Math.min(
        page * perPage,
        data.totalItems || 0,
      )} of ${data.totalItems || 0} providers`
    : "";

  const providerAdminTableColumns = [
    { key: "provider", label: "Provider" },
    { key: "available", label: "Available" },
    { key: "role", label: "Role" },
    { key: "fixedUsdPerRvu", label: "Fixed RVU" },
    { key: "payoutEnabled", label: "Payout Enabled" },
    { key: "tracker", label: "RVU Tracker" },
    { key: "targeting", label: "Targeting Enabled" },
    { key: "lnqEnabled", label: "Create LnQ" },
    { key: "status", label: "Application Status" },
    { key: "rvuTrackerVisibility", label: "RVU Tracker Visibility" },
    { key: "actions", label: "" },
  ];

  const createSortableHeaders = () => (
    <>
      <SortableHeader
        label="Provider"
        sortKey="provider"
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
      />
      <Th padding={4}>Available</Th>
      <Th padding={4}>Role</Th>
      <Th padding={4}>Fixed RVU</Th>
      <Th padding={4}>Payout Enabled</Th>
      <Th padding={4}>RVU Tracker</Th>
      <Th padding={4}>Targeting Enabled</Th>
      <Th padding={4}>Create LnQ</Th>
      <SortableHeader
        label="Application Status"
        sortKey="status"
        currentSortBy={sortBy}
        currentSortDirection={sortDirection}
        onSort={handleSort}
      />
      <Th padding={4}>RVU Tracker Visibility</Th>
      <Th padding={4}></Th>
    </>
  );

  const providerTableColumns = [
    { key: "provider", label: "Provider" },
    { key: "available", label: "Available" },
    { key: "role", label: "Role" },
  ];

  const getProviderStatus = (provider: GroupProvider) => {
    if (
      provider.user.accountStatus === "temp_password" ||
      provider.user.accountStatus === "pending_first_login"
    ) {
      return "Invited";
    }
    return provider.status === "pending" ? "Pending" : "Approved";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Pending") return assetIcons.clock;
    if (status === "Invited") return assetIcons.arrowDown;
    return assetIcons.check;
  };

  const getStatusColor = (status: string) => {
    if (status === "Pending") return THEME_COLORS.gray[500];
    if (status === "Invited") return "yellow.400";
    return "#69CE53";
  };

  const providersData = useMemo((): EnhancedGroupProvider[] => {
    if (searchQuery.trim() && searchResults?.providers) {
      return searchResults.providers.map(
        (provider: GroupProvider): EnhancedGroupProvider => {
          return {
            ...provider,
            provider: `${provider.user.lastName} ${provider.user.firstName}`,
            isAvailable: provider.user.isAvailable ?? false,
            available: provider.user.isAvailable ?? false ? "Yes" : "No",
            status: getProviderStatus(provider),
          };
        },
      );
    }

    const providers = (groupProviders ?? [])
      .map((provider: GroupProvider): EnhancedGroupProvider => {
        return {
          ...provider,
          provider: `${provider.user.lastName} ${provider.user.firstName}`,
          isAvailable: provider.user.isAvailable ?? false,
          available: provider.user.isAvailable ?? false ? "Yes" : "No",
          status: getProviderStatus(provider),
        };
      })
      .filter((provider) => {
        if (isGroupAdmin) return true;
        return !isGroupAdmin && provider.status === "Approved";
      });

    return providers;
  }, [groupProviders, isGroupAdmin, searchQuery, searchResults]);

  const approveProvider = (id: string) => {
    acceptGroupRequest({ id, groupId: group.id });
  };

  const rejectProvider = (id: string) => {
    removeUserFromGroup({ id, groupId: group.id });
  };

  const navigateToProvider = (groupProviderId: string) => {
    navigate(`/groups/provider/${groupProviderId}`);
  };

  const removeProvider = (id: string) => {
    removeUserFromGroup({ id, groupId: group.id });
  };

  const setGroupProviderRoleForGroup = (
    groupProviderId: string,
    role: "admin" | "member",
  ) => {
    setGroupProviderRole({ groupProviderId, groupId: group.id, role });
  };

  const handleOnRVUTracker =
    (groupProviderId: string) => (e: ChangeEvent<HTMLInputElement>) => {
      setGroupRVUTackerOptIn({
        groupProviderId,
        groupId: group.id,
        rvuTrackerOptIn: e.target.checked,
      });
    };

  const handleOnPayoutEnabledToggle =
    (groupProviderId: string) => (e: ChangeEvent<HTMLInputElement>) => {
      setGroupProviderPayoutEnabled({
        groupProviderId,
        groupId: group.id,
        payoutEnabled: e.target.checked,
      });
    };

  const handleOnTargetingEnabledToggle =
    (groupProviderId: string) => (e: ChangeEvent<HTMLInputElement>) => {
      setGroupProviderTargetingEnabled({
        groupProviderId,
        groupId: group.id,
        targetingEnabled: e.target.checked,
      });
    };

  const handleOnLnqEnabledToggle =
    (groupProviderId: string) => (e: ChangeEvent<HTMLInputElement>) => {
      setGroupProviderLnqEnabled({
        groupProviderId,
        groupId: group.id,
        lnqEnabled: e.target.checked,
      });
    };

  const debouncedSetFixedUsdPerRvu = useCallback(
    debounce((groupProviderId: string, value: number) => {
      setGroupProviderFixedUsdPerRvu({
        groupProviderId,
        groupId: group.id,
        fixedUsdPerRvuEnabled: true,
        fixedUsdPerRvu: value,
      });
    }, 500),
    [group.id],
  );

  useEffect(() => {
    return () => {
      debouncedSetFixedUsdPerRvu.cancel();
    };
  }, [debouncedSetFixedUsdPerRvu]);

  const handleFixedUsdPerRvuChange =
    (groupProviderId: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValues((prev) => ({ ...prev, [groupProviderId]: value }));

      const numValue = Number.parseFloat(value);
      if (!Number.isNaN(numValue)) {
        if (numValue === 0) {
          setGroupProviderFixedUsdPerRvu({
            groupProviderId,
            groupId: group.id,
            fixedUsdPerRvuEnabled: false,
            fixedUsdPerRvu: 0,
          });
        } else {
          debouncedSetFixedUsdPerRvu(groupProviderId, numValue);
          setGroupProviderFixedUsdPerRvu({
            groupProviderId,
            groupId: group.id,
            fixedUsdPerRvuEnabled: true,
            fixedUsdPerRvu: numValue,
          });
        }
      }
    };

  const handleFixedUsdPerRvuToggle =
    (groupProviderId: string, row: GroupProvider) => (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked;
      const rawValue = inputValues[groupProviderId] ?? row.fixedUsdPerRvu;
      const currentAmount = Number.parseFloat(rawValue ?? "0");
      if (newValue && (!rawValue || currentAmount === 0)) {
        toast({
          title: "Enter a value greater than 0 to enable Fixed RVU",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setGroupProviderFixedUsdPerRvu({
        groupProviderId,
        groupId: group.id,
        fixedUsdPerRvuEnabled: newValue,
        fixedUsdPerRvu: currentAmount,
      });
    };

  const isButtonDisabled = () => {
    return isAcceptingGroupRequest ?? isRemovingUserFromGroup;
  };

  const groupRow = (row: GroupProvider) => {
    return (
      <>
        <Td>
          <Text textStyle={"smMdSemi"}>
            {row.provider}
            {row.user.disabled && (
              <Badge mx={2} colorScheme="error">
                Deleted
              </Badge>
            )}
          </Text>
        </Td>
        <Td>
          <Text textStyle={"smBold"}>{row.available}</Text>
        </Td>
        <Td>
          <Text textStyle={"smBold"}>{row.role === "admin" ? "Admin" : "Provider"}</Text>
        </Td>
        {isGroupAdmin && (
          <>
            <Td>
              <HStack>
                <Switch
                  isToggled={(row.fixedUsdPerRvu ?? 0) > 0 && !!row.fixedUsdPerRvuEnabled}
                  onToggle={handleFixedUsdPerRvuToggle(row.id, row)}
                />
                <InputGroup w="80px" ml={5}>
                  <InputLeftElement
                    pointerEvents="none"
                    color="gray.300"
                    fontWeight="bold"
                    fontSize="s"
                    h="20px"
                  >
                    $
                  </InputLeftElement>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={inputValues[row.id] ?? row.fixedUsdPerRvu ?? ""}
                    onChange={handleFixedUsdPerRvuChange(row.id)}
                    borderRadius="16px"
                    bg="#181B34"
                    color="white"
                    borderColor="#8E959E"
                    borderWidth="1px"
                    pl={8}
                    pr={2}
                    h="20px"
                    fontWeight="500"
                    fontSize="sm"
                    _placeholder={{ color: "gray.400" }}
                    _focus={{ borderColor: "#6B73FF", boxShadow: "none" }}
                    placeholder="0.00"
                  />
                </InputGroup>
              </HStack>
            </Td>
            <Td>
              <Switch
                isToggled={row.payoutEnabled}
                onToggle={handleOnPayoutEnabledToggle(row.id)}
              />
            </Td>
            <Td>
              <Switch
                isToggled={row.rvuTrackerOptIn}
                onToggle={handleOnRVUTracker(row.id)}
              />
            </Td>
            <Td>
              <Switch
                isToggled={row.targetingEnabled}
                onToggle={handleOnTargetingEnabledToggle(row.id)}
              />
            </Td>
            <Td>
              <Switch
                isToggled={row.lnqEnabled}
                onToggle={handleOnLnqEnabledToggle(row.id)}
                disabled={isGroupAdmin && currentUser?.id === row.user.id}
              />
            </Td>
            <Td>
              <HStack>
                <Image src={getStatusIcon(row.status)} />
                <Text textStyle={"smBold"} color={getStatusColor(row.status)}>
                  {row?.status}
                </Text>
              </HStack>
            </Td>
            <Td textAlign="center" style={{ paddingLeft: 24 }}>
              <CustomSelect
                options={[
                  { value: "view_all", label: "View all" },
                  { value: "view_self", label: "View self" },
                  { value: "none", label: "None" },
                ]}
                value={row.rvuTrackerVisibility}
                onValueChange={(val) =>
                  setGroupRVUTrackerVisibility({
                    groupProviderId: row.id,
                    groupId: group.id,
                    visibility: val as RVUTrackerVisibility,
                  })
                }
                minW="140px"
              />
            </Td>
            <Td width={"25%"}>
              <HStack justify="flex-end">
                {row.status === "Pending" && (
                  <>
                    <Button
                      variant="outline"
                      color="white"
                      size="sm"
                      onClick={() => approveProvider(row.id)}
                      isLoading={isButtonDisabled()}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      borderColor="white"
                      textColor="error.400"
                      onClick={() => rejectProvider(row.id)}
                      isLoading={isButtonDisabled()}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <ProvidersTableRowMenu
                  groupProvider={row}
                  navigateToProvider={navigateToProvider}
                  removeProvider={removeProvider}
                  setGroupProviderRoleForGroup={setGroupProviderRoleForGroup}
                  currentUser={currentUser}
                  groupId={group.id}
                />
              </HStack>
            </Td>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <HStack pt={4}>
        <SearchInput
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search providers..."
          inputHeight="56px"
        />
        {searchError && (
          <Text fontSize="sm" color="red.400" mb={2}>
            Search error: Failed to search providers
          </Text>
        )}
      </HStack>
      <StickyTableContainer variant="spaced">
        <StyledTable
          key={`${sortBy}-${sortDirection}-${sortKey}`}
          columns={isGroupAdmin ? providerAdminTableColumns : providerTableColumns}
          customRowRenderers={groupRow}
          data={providersData ?? []}
          loading={
            isGettingProvidersInGroup ||
            (searchQuery.trim().length > 0 && isSearchingProviders)
          }
          size="sm"
          headerColumns={isGroupAdmin ? createSortableHeaders() : undefined}
        />
      </StickyTableContainer>
      {searchQuery.trim().length === 0 && (
        <>
          <Pagination pages={data?.totalPages ?? 0} currentPage={page} setPage={setPage} />
          {paginationInfo && (
            <Text textStyle="sm" color="#A3AEBF" mt={2} textAlign="center">
              {paginationInfo}
            </Text>
          )}
        </>
      )}
    </>
  );
};
