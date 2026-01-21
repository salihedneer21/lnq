import React, { useMemo, useState } from "react";
import { Box, Button, Flex, HStack, Table, Tbody, Text, VStack } from "@chakra-ui/react";

import { useGetGroup } from "~/api/GroupApi";
import {
  useGetGroupCPTOverrides,
  useResetToMasterCPT,
  useSearchCPTCodes,
  useUpdateCPTOverride,
} from "~/api/CPTSettingsApi";
import ModalContainer from "~/components/ModalContainer/ModalContainer";

import { CPTTableRow } from "./CPTSettings/CPTTableRow";
import { SearchInput } from "./SearchInput";

interface CPTSettingsProps {
  groupId: string;
}

type ModalType = "edit" | "save" | "reset" | "success" | "successReset" | null;

const CPTSettings: React.FC<CPTSettingsProps> = ({ groupId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRVUs, setEditingRVUs] = useState<Record<string, number>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [pendingEdit, setPendingEdit] = useState<string | null>(null);
  const [pendingSave, setPendingSave] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);

  const { data: groupData } = useGetGroup(groupId);
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useSearchCPTCodes(groupId, searchQuery);
  const { data: overrides, refetch: refetchOverrides } = useGetGroupCPTOverrides(groupId);
  const { mutate: updateOverride } = useUpdateCPTOverride();
  const { mutate: resetToMasterCPT, isPending: isResetting } = useResetToMasterCPT();

  const displayData = useMemo(() => {
    if (!searchResults) return [];
    const overrideMap = new Map(
      (overrides ?? []).map((override) => [override.cptCode, override]),
    );

    return searchResults.map((result) => {
      const override = overrideMap.get(result.cptCode);
      return {
        ...result,
        override,
        groupRVU: override ? override.groupRVU : result.masterRVU,
      };
    });
  }, [searchResults, overrides]);

  const hasOverrides = searchResults?.some((result) => result.isOverride);

  // Main handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleEditClick = (cptCode: string) => {
    setPendingEdit(cptCode);
    setModalType("edit");
    setIsOpen(true);
  };

  const handleSaveClick = (cptCode: string) => {
    setPendingSave(cptCode);
    setModalType("save");
    setIsOpen(true);
  };

  const handleResetClick = () => {
    setModalType("reset");
    setIsOpen(true);
  };

  const handleDownloadOverrides = () => {
    if (!overrides || overrides.length === 0) return;

    const csvContent = [
      "CPT Code,Group RVU,Created At",
      ...overrides.map(
        (override) => `${override.cptCode},${override.groupRVU},${override.createdAt}`,
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${groupData?.group?.facilityName} RVU Overrides List.csv`;
    document.body.append(a);
    a.click();
    document.body.removeChild(a);
    globalThis.URL.revokeObjectURL(url);
  };

  const handleModalClose = () => {
    setPendingEdit(null);
    setPendingSave(null);
    setModalType(null);
    setIsOpen(false);
  };

  const handleSuccessModalClose = () => {
    setModalType(null);
    setIsOpen(false);
  };

  const confirmSave = () => {
    if (pendingSave) {
      const newValue = editingRVUs[pendingSave];
      const original = displayData.find((item) => item.cptCode === pendingSave)?.groupRVU;
      if (newValue !== undefined && newValue !== original) {
        updateOverride(
          { groupId, cptCode: pendingSave, groupRVU: newValue },
          {
            onSuccess: () => {
              refetchOverrides();
              if (searchQuery.length >= 3) {
                refetchSearch();
              }
              setEditMode((prev) => ({ ...prev, [pendingSave]: false }));
              setEditingRVUs((prev) => {
                const newState = { ...prev };
                delete newState[pendingSave];
                return newState;
              });
              setModalType(null);
              setIsOpen(false);
              setTimeout(() => {
                setModalType("success");
                setIsOpen(true);
              }, 300);
            },
          },
        );
      } else {
        setEditMode((prev) => ({ ...prev, [pendingSave]: false }));
        setEditingRVUs((prev) => {
          const newState = { ...prev };
          delete newState[pendingSave];
          return newState;
        });
        setPendingSave(null);
        setModalType(null);
        setIsOpen(false);
      }
      setPendingSave(null);
    }
  };

  const confirmEdit = () => {
    if (pendingEdit) {
      setEditMode((prev) => ({ ...prev, [pendingEdit]: true }));
      const currentItem = displayData.find((item) => item.cptCode === pendingEdit);
      if (currentItem) {
        // If the current value is 0, we don't set it initially to allow empty input
        const initialValue = currentItem.groupRVU === 0 ? 0 : currentItem.groupRVU;
        setEditingRVUs((prev) => ({
          ...prev,
          [pendingEdit]: initialValue,
        }));
      }
      setPendingEdit(null);
      setModalType(null);
      setIsOpen(false);
    }
  };

  const confirmReset = () => {
    if (searchResults && searchResults.length > 0) {
      const resetPromises = searchResults
        .filter((result) => result.isOverride)
        .map(
          (result) =>
            new Promise<void>((resolve) => {
              resetToMasterCPT(
                { groupId, cptCode: result.cptCode },
                { onSuccess: () => resolve() },
              );
            }),
        );

      Promise.all(resetPromises).then(() => {
        refetchOverrides();
        if (searchQuery.length >= 3) {
          refetchSearch();
        }
        setModalType(null);
        setIsOpen(false);
        setTimeout(() => {
          setModalType("successReset");
          setIsOpen(true);
        }, 300);
      });
    } else {
      setModalType(null);
      setIsOpen(false);
    }
  };

  const handleRVUChange = (cptCode: string, value: string) => {
    if (value === "") {
      // Allow empty value
      setEditingRVUs((prev) => ({
        ...prev,
        [cptCode]: 0,
      }));
    } else {
      const numValue = Number.parseFloat(value);
      if (!Number.isNaN(numValue)) {
        setEditingRVUs((prev) => ({
          ...prev,
          [cptCode]: numValue,
        }));
      }
    }
  };

  return (
    <Box mt={8}>
      <VStack spacing={4} align="stretch">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={{ base: 4, md: 0 }}
          mb={4}
          px={{ base: 2, md: 0 }}
          p={{ base: 2, md: 3 }}
        >
          <HStack
            spacing={{ base: 4, md: 8 }}
            align="center"
            justify={{ base: "space-between", md: "flex-start" }}
            w={{ base: "full", md: "auto" }}
          >
            <SearchInput
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder="Search CPT codes"
              boxProps={{
                minW: { base: "140px", sm: "200px", md: "360px", lg: "520px" },
                maxW: { base: "100%", sm: "280px", md: "520px", lg: "640px" },
              }}
            />
            <Text
              color="brandYellow.500"
              fontWeight="bold"
              cursor="pointer"
              onClick={handleResetClick}
              opacity={!hasOverrides || isResetting ? 0.5 : 1}
              pointerEvents={!hasOverrides || isResetting ? "none" : "auto"}
              _hover={{ textDecoration: "underline" }}
              fontSize={{ base: "sm", md: "md" }}
              whiteSpace="nowrap"
            >
              Reset to default values
            </Text>
          </HStack>
          <HStack
            spacing={3}
            justify={{ base: "center", md: "flex-end" }}
            w={{ base: "full", md: "auto" }}
          >
            <Button
              variant="outline"
              color="white"
              borderColor="white"
              fontWeight="bold"
              onClick={handleDownloadOverrides}
              isDisabled={!overrides || overrides.length === 0}
              size={{ base: "sm", md: "md" }}
              w={{ base: "full", sm: "auto" }}
            >
              Download List
            </Button>
          </HStack>
        </Flex>

        {searchQuery.length === 0 && (
          <Box textAlign="left" color="white" fontSize="18">
            To get started, search for a specific CPT code to view its current RVU value.
            You can edit values as needed to reflect your group&apos;s custom gRVUs.
          </Box>
        )}

        {searchQuery.length >= 3 &&
          !isSearchLoading &&
          (!searchResults || searchResults.length === 0) && (
            <Box mt={8} textAlign="left" color="white" fontSize="18">
              We couldn&apos;t find a match for this CPT code in our database. Please
              double-check the code for accuracy. If you believe this is an error, contact
              LnQ support or try a different code.
            </Box>
          )}

        {searchQuery.length >= 3 && searchResults && searchResults.length > 0 && (
          <Box
            overflowX="auto"
            px={{ base: 2, md: 0 }}
            sx={{
              "&::-webkit-scrollbar": { height: "8px" },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(255, 255, 255, 0.3)",
                borderRadius: "4px",
              },
            }}
          >
            <Table border="none" variant="unstyled" minW={{ base: "600px", md: "auto" }}>
              <Tbody>
                {displayData.map((item) => (
                  <CPTTableRow
                    key={item.cptCode}
                    item={item}
                    editMode={editMode[item.cptCode] ?? false}
                    editingValue={editingRVUs[item.cptCode] ?? item.groupRVU}
                    onRVUChange={(value) => handleRVUChange(item.cptCode, value)}
                    onEditClick={() => handleEditClick(item.cptCode)}
                    onSaveClick={() => handleSaveClick(item.cptCode)}
                    onPressEnter={() => handleSaveClick(item.cptCode)}
                  />
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>

      <ModalContainer
        isOpen={isOpen}
        onClose={handleModalClose}
        title={(() => {
          switch (modalType) {
            case "edit":
              return "Are you sure you want to edit Group RVU's?";
            case "save":
              return "Are you sure you want to save changes to the gRVUs?";
            case "reset":
              return "Are you sure you want to reset to default values for these codes?";
            case "success":
              return "Your gRVU has been successfully applied to the CPT code.";
            case "successReset":
              return "The codes have been successfully reset to the default values.";
            default:
              return "";
          }
        })()}
        variant={
          modalType === "success" || modalType === "successReset" ? "success" : "default"
        }
        leftButtonTitle={
          modalType === "success" || modalType === "successReset" ? "" : "Cancel"
        }
        rightButtonTitle={(() => {
          switch (modalType) {
            case "edit":
              return "Edit";
            case "save":
              return "Save";
            case "reset":
              return "Reset";
            default:
              return "";
          }
        })()}
        singleButtonTitle={
          modalType === "success" || modalType === "successReset" ? "OK" : ""
        }
        onClickLeftButton={
          modalType === "success" || modalType === "successReset"
            ? undefined
            : handleModalClose
        }
        onClickRightButton={(() => {
          switch (modalType) {
            case "edit":
              return confirmEdit;
            case "save":
              return confirmSave;
            case "reset":
              return confirmReset;
            default:
              return undefined;
          }
        })()}
        onClickSingleButton={
          modalType === "success" || modalType === "successReset"
            ? handleSuccessModalClose
            : undefined
        }
      />
    </Box>
  );
};

export default CPTSettings;
