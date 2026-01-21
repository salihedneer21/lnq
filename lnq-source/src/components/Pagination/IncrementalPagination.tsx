import { Button, Flex, Icon } from "@chakra-ui/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import type { IconType } from "react-icons";
import { ReactNode } from "react";

interface IncrementalPaginationProps {
  currentPage: number;
  setPage: (page: number) => void;
  hasMore: boolean;
}

const PagButton = (props: {
  disabled?: boolean;
  active?: boolean;
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  const activeStyle = {
    bg: "brandYellow.600",
    color: "brandBlue.800",
  };
  return (
    <Button
      onClick={props.onClick}
      mx={1}
      px={4}
      py={2}
      variant={"ghost"}
      rounded="md"
      color="gray.400"
      opacity={props.disabled ? 0.6 : 1}
      _hover={!props.disabled ? activeStyle : undefined}
      cursor={props.disabled ? "not-allowed" : "pointer"}
      isDisabled={props.disabled}
      {...(props.active && activeStyle)}
    >
      {props.children}
    </Button>
  );
};

export const IncrementalPagination = ({
  currentPage,
  setPage,
  hasMore,
}: IncrementalPaginationProps) => {
  return (
    <Flex w="full" alignItems="center" justifyContent="center">
      <Flex>
        <PagButton onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1}>
          <Icon
            as={IoIosArrowBack as IconType}
            _hover={{
              color: "brandBlue.800",
            }}
            color="gray.400"
            _dark={{
              color: "gray.200",
            }}
            boxSize={4}
          />
        </PagButton>

        <PagButton onClick={() => setPage(currentPage + 1)} disabled={!hasMore}>
          <Icon
            as={IoIosArrowForward as IconType}
            _hover={{
              color: "brandBlue.800",
            }}
            color="gray.400"
            _dark={{
              color: "gray.200",
            }}
            boxSize={4}
          />
        </PagButton>
      </Flex>
    </Flex>
  );
};

export default IncrementalPagination;
