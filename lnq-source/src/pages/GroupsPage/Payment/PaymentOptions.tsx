import { useRef } from "react";
import { IconType } from "react-icons";
import { FiPlus } from "react-icons/fi";
import { Button, GridItem, Icon, IconButton, Radio, Text, VStack } from "@chakra-ui/react";

import AddGroupPaymentMethodModal from "./AddGroupPaymentMethodModal";
import { queryClient } from "../../../api/QueryClient";
import {
  useRemoveGroupPaymentMethodOption,
  useSetPreferredPaymentMethodId,
} from "../../../api/GroupApi";
import {
  FaCcAmex,
  FaCcDinersClub,
  FaCcDiscover,
  FaCcJcb,
  FaCcMastercard,
  FaCcVisa,
  FaCircleMinus,
  FaQuestion,
} from "react-icons/fa6";
import { CiBank } from "react-icons/ci";
import _ from "lodash";
import { PaymentMethod } from "@stripe/stripe-js";

type BrandName =
  | "amex"
  | "diners"
  | "discover"
  | "eftpos_au"
  | "jcb"
  | "link"
  | "mastercard"
  | "unionpay"
  | "visa"
  | "unknown"
  | "us_bank_account";

const payMethodsIcon: Record<BrandName, IconType | null> = {
  amex: FaCcAmex as IconType,
  diners: FaCcDinersClub as IconType,
  discover: FaCcDiscover as IconType,
  visa: FaCcVisa as IconType,
  jcb: FaCcJcb as IconType,
  mastercard: FaCcMastercard as IconType,
  link: null,
  unionpay: null,
  eftpos_au: null,
  unknown: null,
  us_bank_account: CiBank as IconType,
};

export const PaymentOption: React.FC<{
  paymentOption: PaymentMethod;
  isChecked: boolean;
  onClick: (id: string) => void;
  groupId: string;
}> = ({ paymentOption, isChecked, onClick, groupId }) => {
  const removePaymentOptionMutation = useRemoveGroupPaymentMethodOption();

  const handleRemovePaymentMethod: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    removePaymentOptionMutation.mutate({
      paymentMethodOptionId: paymentOption.id,
      id: groupId,
    });
  };

  const cardBrand =
    paymentOption.type === "card"
      ? (paymentOption.card?.brand as BrandName)
      : "us_bank_account";

  return (
    <GridItem display="flex" alignItems="center" w="100%" gap="4">
      <GridItem
        as="button"
        px="4"
        py="5"
        borderRadius="2xl"
        borderColor="brandYellow.400"
        borderWidth="thin"
        display="flex"
        alignItems="center"
        gap="4"
        flexGrow="1"
        onClick={() => onClick(paymentOption.id)}
      >
        <Radio isChecked={isChecked} />
        <Icon
          color="brandYellow.400"
          boxSize="10"
          as={payMethodsIcon[cardBrand] ?? (FaQuestion as IconType)}
        />
        <Text textStyle="bodyBold" fontSize="md" textAlign="left">
          **** **** ****{" "}
          {cardBrand === "us_bank_account"
            ? paymentOption.us_bank_account?.last4
            : paymentOption.card?.last4}{" "}
          {isChecked ? (
            <Text textStyle="sm" fontSize="xx-small" lineHeight={0} mt="1" color="gray.400">
              (Chosen as default payout payment method)
            </Text>
          ) : null}
        </Text>
      </GridItem>
      <IconButton
        ml="auto"
        onClick={handleRemovePaymentMethod}
        variant="ghost"
        colorScheme="brandYellow"
        _hover={{ bgColor: "blackAlpha.400" }}
        aria-label="remove-payment-option"
        icon={<FaCircleMinus />}
      />
    </GridItem>
  );
};

export const AddPaymentOption: React.FC<{ groupId: string; onSuccess: () => void }> = (
  props,
) => {
  const modalRef = useRef<{ open: () => void } | null>(null);
  const handleOnAddPaymentOption = () => {
    modalRef.current?.open();
  };
  return (
    <>
      <GridItem
        alignItems="center"
        alignSelf="flex-start"
        width="100%"
        onClick={handleOnAddPaymentOption}
      >
        <Button leftIcon={<FiPlus />} colorScheme="brandYellow" color="brandBlue.800">
          Add a new payment option
        </Button>
      </GridItem>
      <AddGroupPaymentMethodModal ref={modalRef} {...props} />
    </>
  );
};

export const PaymentOptions: React.FC<{
  paymentOptions: PaymentMethod[];
  preferredPaymentMethodId?: string;
  groupId: string;
}> = (props) => {
  const { mutateAsync } = useSetPreferredPaymentMethodId();

  const handleChoosePaymentMethod = (id: string) => {
    mutateAsync({ id: props.groupId, paymentMethodOptionId: id });
  };

  const handleOnAddedPaymentMethod = () => {
    queryClient.invalidateQueries({ queryKey: ["group", { id: props.groupId }] });
    queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    queryClient.invalidateQueries({ queryKey: ["allGroups"] });
  };
  const chosenPaymentMethodId =
    props.preferredPaymentMethodId ?? props.paymentOptions?.[0]?.id;
  return (
    <VStack rowGap="6">
      {props.paymentOptions.map((paymentOption) => (
        <PaymentOption
          key={paymentOption.id}
          paymentOption={paymentOption}
          groupId={props.groupId}
          isChecked={chosenPaymentMethodId === paymentOption.id}
          onClick={handleChoosePaymentMethod}
        />
      ))}
      <AddPaymentOption groupId={props.groupId} onSuccess={handleOnAddedPaymentMethod} />
    </VStack>
  );
};
