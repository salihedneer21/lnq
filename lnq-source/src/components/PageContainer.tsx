import { Container, ContainerProps, Flex, FlexProps } from "@chakra-ui/react";
import { PropsWithChildren, useMemo } from "react";

type ContainerVariant = "default" | "centered-auth";

interface Props {
  variant?: ContainerVariant;
}

const PageContainer: React.FC<PropsWithChildren<Props>> = ({
  children,
  variant = "default",
}) => {
  const containerProps: ContainerProps = useMemo(() => {
    switch (variant) {
      case "centered-auth":
        return { minH: "100%", minW: "100%", bg: "brandBlue.800" };
      default:
        return {
          minH: "100%",
          minW: "100%",
          pt: 42,
          px: "17%",
          bg: "darkBlue.900",
        };
    }
  }, [variant]);

  const flexProps: FlexProps = useMemo(() => {
    switch (variant) {
      case "centered-auth":
        return {
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minH: "100vh",
        };
      default:
        return { flexDirection: "column", width: "100%", minH: "100vh" };
    }
  }, [variant]);

  return (
    <Container {...containerProps}>
      <Flex {...flexProps}>{children}</Flex>
    </Container>
  );
};

export default PageContainer;
