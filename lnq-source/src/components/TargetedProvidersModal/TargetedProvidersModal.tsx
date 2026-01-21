import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useGetCodeYellowTargetedProvidersWithAvailability } from "../../api/CodeYellowApi";
import { useUserData } from "../../api/UserApi";
import { TargetedProvidersColSettings } from "./TargetedProvidersColSettings";
import { TargetedProvidersCaption } from "./TargetedProvidersCaption";
import TargetedProvidersRow from "./TargetedProvidersRow";

interface Provider {
  id: string;
  name: string;
  availability: boolean;
  canOptIn: boolean;
  canOptOut: boolean;
  responded: boolean;
  respondingProvider?: {
    id: string;
    timeOptIn: string;
    timeOptOut?: string;
    user: { id: string };
  };
}

const TargetedProvidersModal: React.FC<{
  codeYellowId: string | null;
  isOpen: boolean;
  onClose: () => void;
  showSwitch?: boolean;
}> = ({ codeYellowId, isOpen, onClose, showSwitch = true }) => {
  const [displayedProviders, setDisplayedProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // const observerRef = useRef<IntersectionObserver | null>(null);
  // const loadingRef = useRef<HTMLDivElement>(null);

  const { data: targetedProvidersWithAvailability } =
    useGetCodeYellowTargetedProvidersWithAvailability(codeYellowId, page, perPage);
  const { data: currentUser } = useUserData();

  const currentPageProviders = targetedProvidersWithAvailability?.targetedProviders ?? [];
  const hasNextPage = targetedProvidersWithAvailability?.hasNextPage ?? false;

  const loadMoreProviders = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setPage((prev) => prev + 1);
  }, [isLoading, hasMore]);

  // Commenting this out for now, using a button to load more providers instead
  // useEffect(() => {
  //   if (!loadingRef.current) return;

  //   observerRef.current = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting && hasMore && !isLoading) {
  //         loadMoreProviders();
  //       }
  //     },
  //     { threshold: 0.1 },
  //   );

  //   observerRef.current.observe(loadingRef.current);

  //   return () => {
  //     if (observerRef.current) {
  //       observerRef.current.disconnect();
  //     }
  //   };
  // }, [loadMoreProviders, hasMore, isLoading]);

  useEffect(() => {
    if (codeYellowId) {
      setDisplayedProviders([]);
      setPage(1);
      setHasMore(true);
      setIsLoading(false);
    }
  }, [codeYellowId]);

  useEffect(() => {
    if (currentPageProviders.length > 0) {
      if (page === 1) {
        setDisplayedProviders(currentPageProviders);
      } else {
        setDisplayedProviders((prev) => [...prev, ...currentPageProviders]);
      }
      setHasMore(hasNextPage);
      setIsLoading(false);
    }
  }, [currentPageProviders, page, hasNextPage]);

  const handleClose = () => {
    onClose();
  };

  const modalWidth = showSwitch ? "400px" : "300px";

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay bg="#14153233" />
      <ModalContent
        borderRadius="24px"
        bgColor="darkBlue2.800"
        sx={{ width: modalWidth }}
        my="auto"
        mx="auto"
        maxH="80vh"
        position="relative"
      >
        {/* Close button at top right */}
        <Button
          aria-label="Close"
          onClick={handleClose}
          position="absolute"
          top="8px"
          right="12px"
          variant="ghost"
          color="white"
          fontSize="3xl"
          fontWeight={"bold"}
          minW="32px"
          minH="32px"
          borderRadius="full"
          _hover={{ bg: "whiteAlpha.200" }}
        >
          &#10005;
        </Button>
        <ModalBody minW="100%" px={0} overflowY="auto">
          <Table variant="unstyled" size="sm" height={"100%"} minH="100%">
            <TargetedProvidersCaption />
            <TargetedProvidersColSettings showSwitch={showSwitch} />
            <Thead>
              <Tr>
                <Th>Provider list</Th>
                <Th textAlign="right">Opted in</Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayedProviders.map((provider) => (
                <TargetedProvidersRow
                  key={provider.id}
                  provider={provider}
                  codeYellowId={codeYellowId}
                  showSwitch={showSwitch}
                  currentUser={currentUser}
                />
              ))}
            </Tbody>
          </Table>
        </ModalBody>

        {hasMore && (
          <ModalFooter px="3">
            <Button
              variant="outline"
              color="white"
              onClick={loadMoreProviders}
              w="100%"
              borderRadius="8px"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load more providers"}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TargetedProvidersModal;
