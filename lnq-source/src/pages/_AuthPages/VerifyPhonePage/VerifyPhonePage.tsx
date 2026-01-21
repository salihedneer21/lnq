import {
  Button,
  Card,
  CardBody,
  Stack,
  Text,
  Center,
  useToast,
  VStack,
  HStack,
  PinInput,
  PinInputField,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

import { PASSWORD_TYPE, AUTH_PAGES } from "../../../base/router/pages";

import { Logo } from "../../../components/Logo";
import { AxiosError } from "axios";
import { useValidCode } from "../../../hooks/useValidCode";
import { useCountDown } from "../../../hooks/useCountdown";
import { useGetAuthUser, useVerifyPhone, useVerifyPhoneCode } from "../../../api/AuthApi";
import PageContainer from "../../../components/PageContainer";
import { THEME_COLORS } from "../../../base/theme/foundations/colors";

const VerifyPhonePage = (): JSX.Element => {
  const { code, setCode, codeIsValid } = useValidCode("");
  const { data: authUser } = useGetAuthUser();
  const navigate = useNavigate();
  const { seconds, setSeconds, setIsActive } = useCountDown(0);
  const toast = useToast();
  const { mutateAsync: verifyPhone, isPending: isLoading } = useVerifyPhone();
  const { mutateAsync: verifyPhoneCode, isPending: isSendingOtp } = useVerifyPhoneCode();

  const submit = () => {
    if (!authUser?.phone || !authUser?.email || !code) return;
    if (codeIsValid === "") {
      verifyPhoneCode({
        phone: authUser?.phone,
        email: authUser?.email,
        code: code,
      })
        .then((response) => {
          toast({ description: response.message, status: "success" });
          navigate(`${AUTH_PAGES.checkPassword}/${PASSWORD_TYPE.signup}`);
        })
        .catch((error: AxiosError) => {
          toast({ description: error.message, status: "error" });
        });
    }
  };

  const onReSendCode = async () => {
    if (!authUser?.phone || !authUser?.email) return;
    setSeconds(15);
    setIsActive(true);
    try {
      await verifyPhone({
        phone: authUser.phone,
        email: authUser.email,
      });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      toast({ description: error.message, status: "error" });
    }
  };

  const isButtonDisabled = () => {
    return codeIsValid !== "" || seconds > 0 || isSendingOtp || isLoading;
  };

  return (
    <PageContainer variant="centered-auth">
      <VStack minH="100%">
        <Logo />
        <Card width={488} marginTop={30}>
          <CardBody paddingLeft={"60px"} paddingRight={"60px"} borderRadius={"20px"}>
            <Text fontSize="md" align="center" mt={2} color="gray">
              Create an account
            </Text>
            <Text align="center">
              Please enter the OTP sent to your phone for registration
            </Text>
            <form>
              <Stack spacing={4} mt={8}>
                <HStack justify={"center"}>
                  <PinInput otp size={"lg"} onChange={(e) => setCode(e)}>
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
                <Button
                  my={4}
                  backgroundColor={THEME_COLORS.brandYellow[500]}
                  textColor={THEME_COLORS.brandBlue[800]}
                  isDisabled={isButtonDisabled()}
                  onClick={submit}
                >
                  Done
                </Button>
                <Button
                  variant={"ghost"}
                  fontSize="md"
                  color="brandBlue.800"
                  me={1}
                  onClick={() => void onReSendCode()}
                >
                  {seconds > 0
                    ? `You can resend a new code in ${seconds} seconds`
                    : "Resend Code"}
                </Button>
                <Center>
                  <ChakraLink
                    as={Link}
                    to={".."}
                    color="gray.600"
                    fontWeight="medium"
                    fontSize="sm"
                    _hover={{ color: "gray.900" }}
                  >
                    Back
                  </ChakraLink>
                </Center>
              </Stack>
            </form>
          </CardBody>
        </Card>
      </VStack>
    </PageContainer>
  );
};

export default VerifyPhonePage;
