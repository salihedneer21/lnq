import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  Box,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Switch as ChakraSwitch,
  Text,
} from "@chakra-ui/react";

import { useUserData } from "~/api/UserApi";
import { THEME_COLORS } from "~/base/theme/foundations/colors";
import { assetIcons } from "~/constants/icons";
import { GroupProvider } from "~/types/Group";

type RVUTrackerVisibility = "view_all" | "view_self" | "none";

interface Props {
  groupProvider: GroupProvider;
}

export interface ProviderStatusPanelRef {
  getStatusData: () => Record<string, unknown>;
  resetStatus: () => void;
}

const ProviderStatusPanel = forwardRef<ProviderStatusPanelRef, Props>(
  ({ groupProvider }, ref) => {
    const { data: currentUser } = useUserData();
    const [localState, setLocalState] = useState({
      role: groupProvider.role,
      rvuTrackerVisibility: groupProvider.rvuTrackerVisibility as RVUTrackerVisibility,
      fixedUsdPerRvu: groupProvider.fixedUsdPerRvu?.toString() ?? "",
      fixedUsdPerRvuEnabled: groupProvider.fixedUsdPerRvuEnabled,
      payoutEnabled: groupProvider.payoutEnabled,
      rvuTrackerOptIn: groupProvider.rvuTrackerOptIn,
      targetingEnabled: groupProvider.targetingEnabled,
      lnqEnabled: groupProvider.lnqEnabled,
    });

    useEffect(() => {
      setLocalState({
        role: groupProvider.role,
        rvuTrackerVisibility: groupProvider.rvuTrackerVisibility as RVUTrackerVisibility,
        fixedUsdPerRvu: groupProvider.fixedUsdPerRvu?.toString() ?? "",
        fixedUsdPerRvuEnabled: groupProvider.fixedUsdPerRvuEnabled,
        payoutEnabled: groupProvider.payoutEnabled,
        rvuTrackerOptIn: groupProvider.rvuTrackerOptIn,
        targetingEnabled: groupProvider.targetingEnabled,
        lnqEnabled: groupProvider.lnqEnabled,
      });
    }, [groupProvider]);

    useImperativeHandle(ref, () => ({
      getStatusData: () => {
        const changes: Record<string, unknown> = {};

        if (localState.role !== groupProvider.role) {
          changes.setGroupProviderRole = {
            role: localState.role,
          };
        }

        if (localState.rvuTrackerVisibility !== groupProvider.rvuTrackerVisibility) {
          changes.setGroupRVUTrackerVisibility = {
            visibility: localState.rvuTrackerVisibility,
          };
        }

        const currentFixedRvu = Number.parseFloat(localState.fixedUsdPerRvu ?? "0") || 0;
        if (
          currentFixedRvu !== groupProvider.fixedUsdPerRvu ||
          localState.fixedUsdPerRvuEnabled !== groupProvider.fixedUsdPerRvuEnabled
        ) {
          changes.setGroupProviderFixedUsdPerRvu = {
            fixedUsdPerRvu: currentFixedRvu,
            fixedUsdPerRvuEnabled: localState.fixedUsdPerRvuEnabled,
          };
        }

        if (localState.payoutEnabled !== groupProvider.payoutEnabled) {
          changes.setGroupProviderPayoutEnabled = {
            payoutEnabled: localState.payoutEnabled,
          };
        }

        if (localState.rvuTrackerOptIn !== groupProvider.rvuTrackerOptIn) {
          changes.setGroupRVUTackerOptIn = {
            rvuTrackerOptIn: localState.rvuTrackerOptIn,
          };
        }

        if (localState.targetingEnabled !== groupProvider.targetingEnabled) {
          changes.setGroupProviderTargetingEnabled = {
            targetingEnabled: localState.targetingEnabled,
          };
        }

        if (localState.lnqEnabled !== groupProvider.lnqEnabled) {
          changes.setGroupProviderLnqEnabled = {
            lnqEnabled: localState.lnqEnabled,
          };
        }

        return changes;
      },
      resetStatus: () => {
        setLocalState({
          role: groupProvider.role,
          rvuTrackerVisibility: groupProvider.rvuTrackerVisibility as RVUTrackerVisibility,
          fixedUsdPerRvu: groupProvider.fixedUsdPerRvu?.toString() ?? "",
          fixedUsdPerRvuEnabled: groupProvider.fixedUsdPerRvuEnabled,
          payoutEnabled: groupProvider.payoutEnabled,
          rvuTrackerOptIn: groupProvider.rvuTrackerOptIn,
          targetingEnabled: groupProvider.targetingEnabled,
          lnqEnabled: groupProvider.lnqEnabled,
        });
      },
    }));

    const getStatusIcon = () => {
      if (groupProvider.status === "pending") return assetIcons.clock;
      if (groupProvider.status === "invited") return assetIcons.arrowDown;
      return assetIcons.check;
    };

    const getStatusColor = () => {
      if (groupProvider.status === "pending") return THEME_COLORS.gray[500];
      if (groupProvider.status === "invited") return "yellow.400";
      return "#69CE53";
    };

    const getStatusText = () => {
      if (groupProvider.status === "pending") return "Pending";
      if (groupProvider.status === "invited") return "Invited";
      return "Approved";
    };

    return (
      <Box
        backgroundColor="darkBlue2.900"
        p="32px"
        borderRadius="16px"
        minW="400px"
        alignSelf="flex-start"
      >
        <Box>
          <Text color="gray.400" fontWeight={500} fontSize="14px">
            Role
          </Text>
          <Select
            value={localState.role}
            onChange={(e) =>
              setLocalState((prev) => ({
                ...prev,
                role: e.target.value as "admin" | "member",
              }))
            }
            bg="#232548"
            color="white"
            borderColor="#8E959E"
            borderWidth="1px"
            mt={1}
          >
            <option style={{ backgroundColor: "darkBlue2.900" }} value="member">
              Provider
            </option>
            <option style={{ backgroundColor: "darkBlue2.900" }} value="admin">
              Admin
            </option>
          </Select>
        </Box>
        <Box mt={4}>
          <Text color="gray.400" fontWeight={500} fontSize="14px" mb={1}>
            RVU Tracker Visibility
          </Text>
          <Select
            value={localState.rvuTrackerVisibility}
            onChange={(e) =>
              setLocalState((prev) => ({
                ...prev,
                rvuTrackerVisibility: e.target.value as RVUTrackerVisibility,
              }))
            }
            bg="#232548"
            color="white"
            borderColor="#8E959E"
            borderWidth="1px"
            minW="140px"
          >
            <option style={{ backgroundColor: "darkBlue2.900" }} value="view_all">
              View all
            </option>
            <option style={{ backgroundColor: "darkBlue2.900" }} value="view_self">
              View self
            </option>
            <option style={{ backgroundColor: "darkBlue2.900" }} value="none">
              None
            </option>
          </Select>
        </Box>
        <Box my={4}>
          <Text color="gray.400" fontWeight={500} fontSize="14px">
            Fixed RVU
          </Text>
          <Box position="relative">
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                color="gray.300"
                fontWeight="bold"
                fontSize="s"
              >
                $
              </InputLeftElement>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={localState.fixedUsdPerRvu}
                onChange={(e) =>
                  setLocalState((prev) => ({ ...prev, fixedUsdPerRvu: e.target.value }))
                }
                bg="#232548"
                color="white"
                borderColor="#8E959E"
                borderWidth="1px"
                pl={8}
                pr="60px"
                fontWeight="500"
                fontSize="sm"
                _placeholder={{ color: "gray.400" }}
                _focus={{ borderColor: "#6B73FF", boxShadow: "none" }}
                placeholder="0.00"
              />
              <Box
                position="absolute"
                right="12px"
                top="50%"
                transform="translateY(-50%)"
                zIndex={1}
              >
                <ChakraSwitch
                  isChecked={
                    localState.fixedUsdPerRvuEnabled &&
                    Number.parseFloat(localState.fixedUsdPerRvu ?? "0") > 0
                  }
                  onChange={(e) =>
                    setLocalState((prev) => ({
                      ...prev,
                      fixedUsdPerRvuEnabled: e.target.checked,
                    }))
                  }
                  colorScheme="brandYellow"
                  size="md"
                  sx={{
                    "span.chakra-switch__track": {
                      bg: "gray.600",
                      _checked: {
                        bg: "brandBlue.800",
                      },
                    },
                    "span.chakra-switch__thumb": {
                      bg: "white",
                      _checked: {
                        bg: "brandYellow.600",
                      },
                    },
                  }}
                />
              </Box>
            </InputGroup>
          </Box>
        </Box>
        <HStack mt={4} justifyContent="space-between">
          <Text color="white">Payout enabled</Text>
          <ChakraSwitch
            isChecked={localState.payoutEnabled}
            onChange={(e) =>
              setLocalState((prev) => ({ ...prev, payoutEnabled: e.target.checked }))
            }
            colorScheme="brandYellow"
            sx={{
              "span.chakra-switch__track": {
                bg: "gray.600",
                _checked: {
                  bg: "brandBlue.800",
                },
              },
              "span.chakra-switch__thumb": {
                bg: "white",
                _checked: {
                  bg: "brandYellow.600",
                },
              },
            }}
          />
        </HStack>
        <HStack mt={4} justifyContent="space-between">
          <Text color="white">RVU Tracker</Text>
          <ChakraSwitch
            isChecked={localState.rvuTrackerOptIn}
            onChange={(e) =>
              setLocalState((prev) => ({ ...prev, rvuTrackerOptIn: e.target.checked }))
            }
            colorScheme="brandYellow"
            sx={{
              "span.chakra-switch__track": {
                bg: "gray.600",
                _checked: {
                  bg: "brandBlue.800",
                },
              },
              "span.chakra-switch__thumb": {
                bg: "white",
                _checked: {
                  bg: "brandYellow.600",
                },
              },
            }}
          />
        </HStack>
        <HStack mt={4} justifyContent="space-between">
          <Text color="white">Targeting enabled</Text>
          <ChakraSwitch
            isChecked={localState.targetingEnabled}
            onChange={(e) =>
              setLocalState((prev) => ({ ...prev, targetingEnabled: e.target.checked }))
            }
            colorScheme="brandYellow"
            sx={{
              "span.chakra-switch__track": {
                bg: "gray.600",
                _checked: {
                  bg: "brandBlue.800",
                },
              },
              "span.chakra-switch__thumb": {
                bg: "white",
                _checked: {
                  bg: "brandYellow.600",
                },
              },
            }}
          />
        </HStack>
        <HStack mt={4} justifyContent="space-between">
          <Text color="white">Create LnQ</Text>
          <ChakraSwitch
            isChecked={localState.lnqEnabled}
            onChange={(e) =>
              setLocalState((prev) => ({ ...prev, lnqEnabled: e.target.checked }))
            }
            colorScheme="brandYellow"
            disabled={currentUser?.id === groupProvider.user.id}
            sx={{
              "span.chakra-switch__track": {
                bg: "gray.600",
                _checked: {
                  bg: "brandBlue.800",
                },
              },
              "span.chakra-switch__thumb": {
                bg: "white",
                _checked: {
                  bg: "brandYellow.600",
                },
              },
            }}
          />
        </HStack>
        <HStack mt={4} justifyContent="space-between">
          <Text color="white">Application status</Text>
          <HStack>
            <Image src={getStatusIcon()} />
            <Text fontWeight={600} color={getStatusColor()}>
              {getStatusText()}
            </Text>
          </HStack>
        </HStack>
      </Box>
    );
  },
);

ProviderStatusPanel.displayName = "ProviderStatusPanel";

export default ProviderStatusPanel;
