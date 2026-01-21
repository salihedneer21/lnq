import {
  Modal,
  ModalOverlay,
  ModalContent,
  HStack,
  ButtonGroup,
  Button,
  Text,
  ModalFooter,
  ModalHeader,
  ModalBody,
  ModalProps as ChakraModalContainerProps,
  StyleProps,
} from "@chakra-ui/react";
import { PropsWithChildren, useMemo } from "react";

import { ModalProps } from "../../types/ModalProps";

type ModalContainerProps = PropsWithChildren<
  ModalProps & Omit<ChakraModalContainerProps, "children" | "variant">
>;

const ModalContainer: React.FC<ModalContainerProps> = ({
  leftButtonTitle,
  rightButtonTitle,
  title,
  onClickLeftButton,
  onClickRightButton,
  subtitle,
  children,
  variant = "default",
  leftButtonEnabled = true,
  rightButtonEnabled = true,
  hideFooter = false,
  width,
  singleButtonTitle,
  onClickSingleButton,
  ...props
}) => {
  const modalContentVariantProps = useMemo(() => {
    const defaultProps: StyleProps = {
      alignItems: "center",
      textAlign: "center",
      px: "70px",
      py: "30px",
      maxW: width ?? "500px",
    };
    const destructiveProps: StyleProps = {
      alignItems: "flex-start",
      textAlign: "left",
      minW: "572px",
      py: "12px",
    };
    const successProps: StyleProps = {
      alignItems: "center",
      textAlign: "center",
      px: "70px",
      py: "30px",
      maxW: width ?? "500px",
    };
    const successResetProps: StyleProps = {
      alignItems: "center",
      textAlign: "center",
      px: "70px",
      py: "30px",
      maxW: width ?? "500px",
    };
    switch (variant) {
      case "default":
        return defaultProps;
      case "destructive":
        return destructiveProps;
      case "success":
        return successProps;
      case "successReset":
        return successResetProps;
      default:
        return defaultProps;
    }
  }, [variant, width]);

  return (
    <Modal {...props} isCentered>
      <ModalOverlay bg="blackAlpha.500" />
      <ModalContent
        borderRadius="24px"
        bgColor="darkBlue2.800"
        {...modalContentVariantProps}
        sx={{ width: width ?? "500px" }}
      >
        <ModalHeader>
          <Text textStyle="h4" color="white" whiteSpace="pre-line">
            {title}
          </Text>
          {subtitle ? (
            <Text
              textStyle={variant == "default" ? "body" : "caption"}
              color="gray.400"
              mt="12px"
            >
              {subtitle}
            </Text>
          ) : null}
        </ModalHeader>
        {children && (
          <ModalBody minW="100%" px={0}>
            {children}
          </ModalBody>
        )}
        <ModalFooter minW="full" hidden={hideFooter}>
          {variant === "success" ? (
            <HStack minW="full" justifyContent="center">
              <Button
                minW="170px"
                variant="solid"
                colorScheme="brandYellow"
                textColor="brandBlue.800"
                onClick={() => onClickSingleButton?.()}
              >
                {singleButtonTitle}
              </Button>
            </HStack>
          ) : (
            <HStack
              minW="full"
              spacing="8px"
              justifyContent={variant === "default" ? undefined : "flex-end"}
            >
              <ButtonGroup>
                <Button
                  minW={variant === "default" ? "170px" : "fit-content"}
                  variant="outline"
                  color="white"
                  isDisabled={!leftButtonEnabled}
                  onClick={() => onClickLeftButton?.()}
                >
                  {leftButtonTitle}
                </Button>
                <Button
                  minW={variant === "default" ? "170px" : "fit-content"}
                  variant="solid"
                  colorScheme={variant === "default" ? "brandYellow" : "error"}
                  textColor={variant === "default" ? "brandBlue.800" : undefined}
                  isDisabled={!rightButtonEnabled}
                  onClick={() => onClickRightButton?.()}
                >
                  {rightButtonTitle}
                </Button>
              </ButtonGroup>
            </HStack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalContainer;
