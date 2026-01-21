import { HStack, Text, Th } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSortBy?: string;
  currentSortDirection?: "ASC" | "DESC";
  onSort: (sortKey: string, direction: "ASC" | "DESC") => void;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  sortKey,
  currentSortBy,
  currentSortDirection,
  onSort,
}) => {
  const isCurrentlySorted = currentSortBy === sortKey;
  const isAscending = currentSortDirection === "ASC";

  const handleSort = () => {
    if (isCurrentlySorted) {
      const newDirection = isAscending ? "DESC" : "ASC";
      onSort(sortKey, newDirection);
    } else {
      onSort(sortKey, "DESC");
    }
  };

  const getSortIcon = () => {
    const iconColor = isCurrentlySorted ? "white" : "gray.500";
    if (isCurrentlySorted) {
      if (isAscending) {
        return <ChevronUpIcon color={iconColor} w={4} h={4} flexShrink={0} />;
      }
      return <ChevronDownIcon color={iconColor} w={4} h={4} flexShrink={0} />;
    }

    return <ChevronUpIcon color={iconColor} w={4} h={4} opacity={0.5} flexShrink={0} />;
  };

  const ariaSort = (() => {
    if (!isCurrentlySorted) return "none";
    if (isAscending) return "ascending";
    return "descending";
  })();

  return (
    <Th
      padding="16px"
      cursor="pointer"
      onClick={handleSort}
      _hover={{ backgroundColor: "darkBlue.800" }}
      transition="background-color 0.2s"
      textAlign="left"
      borderBottom="1px solid"
      borderColor="gray.700"
      aria-sort={ariaSort}
      backgroundColor={isCurrentlySorted ? "darkBlue.600 !important" : "transparent"}
    >
      <HStack spacing={2} justify="flex-start" align="center">
        <Text
          color={isCurrentlySorted ? "white" : "#8E959E"}
          fontSize="sm"
          fontWeight={isCurrentlySorted ? "700" : "medium"}
        >
          {label}
        </Text>
        {getSortIcon()}
      </HStack>
    </Th>
  );
};
