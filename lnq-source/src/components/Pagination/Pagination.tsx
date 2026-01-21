import { Box, Button, Flex, Icon, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import {
  IoIosArrowBack,
  IoIosArrowForward,
  IoIosSkipBackward,
  IoIosSkipForward,
} from "react-icons/io";

interface PaginationProps {
  pages: number;
  currentPage: number;
  setPage: (page: number) => void;
  siblingCount?: number;
}
export const Pagination = ({
  pages,
  currentPage,
  setPage,
  siblingCount = 1,
}: PaginationProps) => {
  const PagButton = (props: {
    disabled?: boolean;
    active?: boolean;
    children?: any;
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        opacity={props.disabled && 0.6}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _hover={!props.disabled && activeStyle}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        cursor={props.disabled && "not-allowed"}
        isDisabled={props.disabled}
        {...(props.active && activeStyle)}
      >
        {props.children}
      </Button>
    );
  };
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  };

  const getDisplayedPages = useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 1;
    const startPage = Math.max(1, currentPage - siblingCount);
    const endPage = Math.min(pages, startPage + totalPageNumbers - 1);
    let displayedPages: (string | number)[] = range(startPage, endPage);
    if (displayedPages[0] !== 1) {
      if (startPage - 1 === 1) {
        displayedPages = [1, ...displayedPages];
      } else {
        displayedPages = [1, "...", ...displayedPages];
      }
    }
    if (displayedPages[displayedPages.length - 1] !== pages) {
      if (endPage + 1 === pages) {
        displayedPages = [...displayedPages, pages];
      } else {
        displayedPages = [...displayedPages, "...", pages];
      }
    }

    return displayedPages;
  }, [currentPage, pages, siblingCount]);

  if (pages === 0) {
    return null;
  }

  return (
    <Flex w="full" alignItems="center" justifyContent="center">
      <Flex>
        <PagButton onClick={() => setPage(1)} disabled={currentPage - 1 === 0}>
          <Icon
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            as={IoIosSkipBackward}
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
        <PagButton
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage - 1 === 0}
        >
          <Icon
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            as={IoIosArrowBack}
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
        {getDisplayedPages.map((page, index) =>
          typeof page === "number" ? (
            <PagButton
              key={page}
              active={page === currentPage}
              onClick={() => setPage(page)}
            >
              {page}
            </PagButton>
          ) : (
            <Box mx={1} py={2} verticalAlign="bottom" key={page + index.toString()}>
              <Text color="gray.400">{page}</Text>
            </Box>
          ),
        )}
        <PagButton
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage + 1 > pages}
        >
          <Icon
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            as={IoIosArrowForward}
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
        <PagButton onClick={() => setPage(pages)} disabled={currentPage + 1 > pages}>
          <Icon
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            as={IoIosSkipForward}
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
