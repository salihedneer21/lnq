import {
  Box,
  Button,
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
  VStack,
  Tooltip,
  Icon,
  TextProps,
} from "@chakra-ui/react";
import {
  GetGroupedUnpaidStudiesResponse,
  useGetGroupedUnpaidStudies,
  usePayoutAllGroupedUnpaidStudies,
} from "../../api/PayoutApi";
import { forwardRef, useImperativeHandle } from "react";
import { InfoIcon } from "@chakra-ui/icons";

interface LabelValueProps {
  label: string;
  value: string | number;
  color?: string;
  spacing?: number;
}

const LabelValue: React.FC<LabelValueProps> = ({
  label,
  value,
  color = "gray.300",
  spacing = 4,
}) => (
  <HStack justify="space-between" width="100%" spacing={spacing}>
    <Text fontSize="sm" color={color}>
      {label}
    </Text>
    <Text fontSize="sm" color="white">
      {value}
    </Text>
  </HStack>
);

interface AmountWithInfoProps {
  amount: string | number;
  tooltipContent: React.ReactNode;
  fontSize?: TextProps["fontSize"];
}

const AmountWithInfo: React.FC<AmountWithInfoProps> = ({
  amount,
  tooltipContent,
  fontSize = "md",
}) => (
  <HStack spacing={2} align="center">
    <Text textStyle="sm" fontSize={fontSize} color="white">
      ${amount}
    </Text>
    <Tooltip
      label={tooltipContent}
      hasArrow
      placement="top"
      bg="gray.800"
      p={0}
      borderRadius="md"
    >
      <Icon
        as={InfoIcon}
        color="gray.400"
        w={3}
        h={3}
        cursor="help"
        _hover={{ color: "gray.300" }}
        ml={0.5}
      />
    </Tooltip>
  </HStack>
);

interface PaymentMethodDetailsProps {
  type: "card" | "us_bank_account";
  baseAmount: number;
  amountWithFee: number;
}

const PaymentMethodDetails: React.FC<PaymentMethodDetailsProps> = ({
  type,
  baseAmount,
  amountWithFee,
}) => {
  console.warn(baseAmount, amountWithFee);
  const adjustmentAmount = Number(amountWithFee) - Number(baseAmount);
  return (
    <VStack align="start" width="100%" spacing={2}>
      <LabelValue
        label={
          type === "card"
            ? "Credit Card processing adjustment (2.9% + $0.30):"
            : "ACH processing adjustment (0.8%):"
        }
        value={`+$${adjustmentAmount.toFixed(2)}`}
      />
    </VStack>
  );
};

const PayoutBox: React.FC<
  GetGroupedUnpaidStudiesResponse["items"][number] & { currency?: string }
> = ({
  facilityName,
  pendingStudiesCount,
  dollarAmount,
  dollarAmountWithFee,
  payoutEnabled,
  preferredPaymentMethodType,
  currency = "$",
}) => {
  const tooltipContent = (
    <VStack align="start" spacing={2} p={3} minW="250px">
      <VStack align="start" spacing={2} width="100%">
        <LabelValue label="Amount:" value={`$${dollarAmount}`} />
        <PaymentMethodDetails
          type={preferredPaymentMethodType}
          baseAmount={Number(dollarAmount)}
          amountWithFee={Number(dollarAmountWithFee)}
        />
        <Divider borderColor="gray.600" />
        <LabelValue label="Total:" value={`$${dollarAmountWithFee}`} />
      </VStack>
    </VStack>
  );

  return (
    <HStack
      width="100%"
      justify="space-between"
      flexGrow="1"
      color={payoutEnabled ? "white" : "gray.500"}
    >
      <Box>
        <Text textStyle="smBold" fontSize="md" color="inherit">
          {facilityName}{" "}
          {payoutEnabled ? (
            ""
          ) : (
            <Text as="span" textStyle="smBold" fontSize="xx-small" color="inherit">
              (Payout disabled)
            </Text>
          )}
        </Text>
        <Text textStyle="sm" color="inherit">
          {pendingStudiesCount} Pending stud{pendingStudiesCount > 1 ? "ies" : "y"}
        </Text>
      </Box>
      <HStack spacing={2} align="center">
        <Text textStyle="sm" fontSize="md" color="inherit">
          {currency}
          {dollarAmountWithFee}
        </Text>
        <Tooltip
          label={tooltipContent}
          hasArrow
          placement="top"
          bg="gray.800"
          p={0}
          borderRadius="md"
        >
          <Icon
            as={InfoIcon}
            color="gray.400"
            w={3}
            h={3}
            cursor="help"
            _hover={{ color: "gray.300" }}
            ml={0.5}
          />
        </Tooltip>
      </HStack>
    </HStack>
  );
};

const PayoutTotalTooltip: React.FC<{ data: GetGroupedUnpaidStudiesResponse }> = ({
  data,
}) => (
  <VStack align="start" spacing={2} p={3} minW="250px">
    <VStack align="start" spacing={2} width="100%">
      <LabelValue label="Amount:" value={`$${data.totalAmount}`} />
      {data.items.map((item, index) => (
        <LabelValue
          key={`${item.facilityName}-${index}`}
          label={`${item.facilityName} ${
            item.preferredPaymentMethodType === "card"
              ? "(CC adjustment)"
              : "(ACH adjustment)"
          }`}
          value={`+$${(
            Number(item.dollarAmountWithFee) - Number(item.dollarAmount)
          ).toFixed(2)}`}
        />
      ))}
      <Divider borderColor="gray.600" />
      <LabelValue label="Total:" value={`$${data.totalAmountWithFee}`} />
    </VStack>
  </VStack>
);

const PayoutDisplay = () => {
  const { data, isError, error, isPending } = useGetGroupedUnpaidStudies();

  if (isPending) {
    return <>Loading...</>;
  }

  if (isError) {
    return <>{error?.message ?? "Something went wrong"}</>;
  }

  return (
    <Box my="16">
      <Text textStyle="smBold" color="gray.400" fontSize="18">
        Payout Breakdown:
      </Text>
      <VStack align="baseline" justify="space-between" mt="4">
        {data.items.map((payoutItem) => (
          <PayoutBox key={payoutItem.id} {...payoutItem} />
        ))}

        <HStack justify="space-between" width="100%" flexGrow="1" align="center">
          <Box>
            <Text textStyle="smBold" fontSize="md">
              Total available balance:
            </Text>
          </Box>
          <Text textStyle="sm" fontSize="md" color="white">
            ${data.totalAmount}
          </Text>
        </HStack>

        <Divider my="4" />
        <HStack justify="space-between" width="100%" flexGrow="1" align="center">
          <Box>
            <Text textStyle="smBold" fontSize="md">
              Payout Total:
            </Text>
          </Box>
          <AmountWithInfo
            amount={data.totalAmountWithFee}
            tooltipContent={<PayoutTotalTooltip data={data} />}
            fontSize="lg"
          />
        </HStack>
      </VStack>
    </Box>
  );
};

const Payout: React.ForwardRefRenderFunction<{ open: () => void }> = (_, ref) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const toast = useToast();
  useImperativeHandle(ref, () => ({ open: onOpen }), [onOpen]);

  const { data: myStudyStatsData } = useGetGroupedUnpaidStudies();

  const { isPending, mutateAsync: payOut } = usePayoutAllGroupedUnpaidStudies();

  const handlePay = async () => {
    await payOut();
    toast({
      description: "Payout is on your way!",
      status: "success",
    });
    onClose();
  };

  const noPayoutAvailable = Number(myStudyStatsData?.totalAmount ?? 0) === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!isPending}
      closeOnEsc={!isPending}
    >
      <ModalOverlay bg="#14153233" />
      <ModalContent
        w="500px"
        maxWidth="70vw"
        h="auto"
        p="20"
        my="auto"
        mx="auto"
        borderRadius="3xl"
        bgColor="darkBlue2.800"
      >
        <ModalHeader textAlign="center" color="white" fontSize="3xl" pt="0" pb="5" px="0">
          LnQ Payout Request
        </ModalHeader>
        <ModalBody p="0">
          <Text textStyle="smBold" fontSize="12" color="gray.400" textAlign="center">
            Please confirm your payout details below. <br />
            Instant payouts are typically processed within minutes, but depending on your
            payment method, they may take up to 24–48 hours to appear in your account.
          </Text>
          <PayoutDisplay />

          <ModalFooter justifyContent="space-between" p="0" mt="6">
            <Button
              variant="outline"
              color="white"
              w="48%"
              onClick={onClose}
              disabled={isPending}
            >
              <Text color="white" fontWeight="700" fontSize="16">
                Cancel
              </Text>
            </Button>
            <Button
              colorScheme="brandYellow"
              w="48%"
              onClick={() => {
                handlePay();
              }}
              isDisabled={isPending || noPayoutAvailable}
            >
              <Text color="white" fontWeight="700" fontSize="16">
                Confirm
              </Text>
            </Button>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const PayoutModal = forwardRef(Payout);
