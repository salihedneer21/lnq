import { Elements, PaymentElement } from "@stripe/react-stripe-js";

import { stripeOptions, stripeClient } from "../../../packages/stripe";
import usePayment from "../../../hooks/usePayment";
import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

const PaymentCard = forwardRef<ReturnType<typeof usePayment>>(function Payment(_, ref) {
  const payment = usePayment();

  useImperativeHandle(ref, () => payment, [payment]);
  return (
    <>
      <PaymentElement />
    </>
  );
});
const AddGroupPaymentMethodModal = forwardRef<
  { open: () => void },
  { groupId: string; onSuccess: () => void }
>(function Wrapper(props, ref) {
  const paymentRef = useRef<ReturnType<typeof usePayment>>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useImperativeHandle(
    ref,
    () => ({
      open: onOpen,
    }),
    [onOpen],
  );

  const handlePayment = () => {
    paymentRef.current?.setupPayment(
      props.groupId,
      () => {
        props.onSuccess();
        onClose();
      },
      console.error,
    );
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} returnFocusOnClose={false}>
      <ModalOverlay />
      <ModalContent w="100%" maxWidth="40rem" bgColor="darkBlue2.800" borderRadius="3xl">
        <ModalHeader color="white">New payment method</ModalHeader>
        <ModalCloseButton color="white" onClick={onClose} />

        <ModalBody>
          <Elements stripe={stripeClient} options={stripeOptions}>
            <PaymentCard ref={paymentRef} />
          </Elements>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Button variant="outline" color="white" w="48%" onClick={onClose}>
            <Text color="white" fontWeight="700" fontSize="16">
              Cancel
            </Text>
          </Button>
          <Button
            colorScheme="brandYellow"
            textColor="brandBlue.800"
            w="48%"
            onClick={handlePayment}
          >
            Add Payment method
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default AddGroupPaymentMethodModal;
