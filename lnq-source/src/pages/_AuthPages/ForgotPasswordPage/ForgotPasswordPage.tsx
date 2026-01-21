import {
  Button,
  Card,
  FormControl,
  FormLabel,
  Input,
  Text,
  PinInput,
  PinInputField,
  VStack,
  CardBody,
  Stack,
  HStack,
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AUTH_PAGES } from "../../../base/router/pages";

import { Logo } from "../../../components/Logo";
import { useValidEmail } from "../../../hooks/useValidEmail";
import { useValidCode } from "../../../hooks/useValidCode";
import { useValidPasswordAdvance } from "../../../hooks/useValidPasswordAdvance";
import {
  useForgotPassword,
  useVerifyEmail,
  useVerifyForgotPasswordCode,
} from "../../../api/AuthApi";
import PageContainer from "../../../components/PageContainer";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { THEME_COLORS } from "../../../base/theme/foundations/colors";

const ForgotPasswordPage = (): JSX.Element => {
  const { email, setEmail, emailIsValid } = useValidEmail(null);
  const { code, setCode } = useValidCode("");
  const [step, setStep] = useState<"setEmail" | "setCode" | "createPass">("setEmail");
  const navigate = useNavigate();
  const [confirmPass, setConfirmPass] = useState("");
  const { passwordAdvance, setPasswordAdvance, passwordAdvanceIsValid } =
    useValidPasswordAdvance(null);

  const toast = useToast();

  const {
    mutateAsync: verifyForgotPasswordCode,
    isPending: isVerifyingForgotPasswordCode,
  } = useVerifyForgotPasswordCode();
  const { mutateAsync: verifyEmail, isPending: isVerifyingEmail } = useVerifyEmail();
  const { mutateAsync: forgotPassword, isPending: isForgotPassword } = useForgotPassword();

  useEffect(() => {
    if (code?.length === 6) {
      // if (!email || !passwordAdvance) return;
      verifyForgotPasswordCode({
        email,
        password: passwordAdvance,
        code,
      });
      setStep("createPass");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const onBackPressed = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setStep("setEmail");
  };

  const onButtonPressed = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    option?: "setEmail" | "setCode" | "createPass" | "resendCode",
  ) => {
    e.stopPropagation();
    try {
      switch (option) {
        case "resendCode":
          if (!email) return;
          await verifyEmail(email);
          break;
        case "createPass":
          if (!email || !passwordAdvance || !code) return;
          await forgotPassword({
            email: email,
            password: passwordAdvance,
            code: code,
          });
          toast({ description: "Password changed successfully", status: "success" });
          navigate(AUTH_PAGES.login);
          break;
        case "setEmail":
          if (!email) return;
          await verifyEmail(email);
          setStep("setCode");
          break;
      }
    } catch (error: any) {
      setConfirmPass("");
      setPasswordAdvance("");
    }
  };

  const isButtonDisabled = () => {
    return (
      emailIsValid !== "" ||
      email === null ||
      email === "" ||
      isVerifyingEmail ||
      isForgotPassword ||
      isVerifyingForgotPasswordCode
    );
  };

  return (
    <PageContainer variant="centered-auth">
      <VStack minH="100%">
        <Logo mx="auto" />
        <Card width={488} marginTop={30}>
          <CardBody paddingLeft={"60px"} paddingRight={"60px"} borderRadius={"20px"}>
            {step === "setEmail" && (
              <form>
                <Text
                  fontSize="lg"
                  align="center"
                  mt={2}
                  color={THEME_COLORS.brandBlue[800]}
                >
                  Forgot your password
                </Text>
                <Text fontSize="md" align="center" mt={2} color="gray">
                  Please enter email below.
                </Text>
                <Stack spacing={4} mt={8}>
                  <FormControl variant="floating">
                    <Input
                      placeholder="" // leave empty for floating label
                      aria-label="Email"
                      name="email"
                      type="email"
                      autoComplete="password"
                      required
                      value={email ?? ""}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isVerifyingEmail}
                      isInvalid={emailIsValid !== ""}
                    />
                    <FormLabel>Email</FormLabel>
                  </FormControl>
                  <Button
                    my={4}
                    backgroundColor={THEME_COLORS.brandYellow[500]}
                    textColor={THEME_COLORS.brandBlue[800]}
                    isLoading={isVerifyingEmail}
                    isDisabled={isButtonDisabled()}
                    onClick={(e) => void onButtonPressed(e, "setEmail")}
                  >
                    Send
                  </Button>
                  <ChakraLink
                    as={Link}
                    to={AUTH_PAGES.login}
                    alignSelf={"center"}
                    color="gray.600"
                    fontWeight="medium"
                    fontSize="sm"
                    _hover={{ color: "gray.900" }}
                  >
                    Back to Login
                  </ChakraLink>
                </Stack>
              </form>
            )}
            {step === "setCode" && (
              <>
                <Text
                  fontSize="lg"
                  align="center"
                  mt={2}
                  color={THEME_COLORS.brandBlue[800]}
                >
                  Forgot your password
                </Text>
                <Text fontSize="md" align="center" mt={2} color="gray">
                  Please check your email account for the verification code we just sent and
                  enter that code below.
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
                      isLoading={isVerifyingEmail}
                      isDisabled={isButtonDisabled()}
                      onClick={(e) => {
                        onButtonPressed(e, "resendCode");
                      }}
                    >
                      {isVerifyingEmail ? "Sending..." : "Resend Code"}
                    </Button>
                    <Button variant={"ghost"} onClick={onBackPressed}>
                      Back
                    </Button>
                  </Stack>
                </form>
              </>
            )}
            {step === "createPass" && (
              <ChangePasswordForm
                confirmPass={confirmPass}
                isButtonDisabled={isButtonDisabled}
                loading={isForgotPassword}
                onBackPressed={onBackPressed}
                onButtonPressed={onButtonPressed}
                passwordAdvance={passwordAdvance}
                passwordAdvanceIsValid={passwordAdvanceIsValid}
                setConfirmPass={setConfirmPass}
                setPasswordAdvance={setPasswordAdvance}
              />
            )}
          </CardBody>
        </Card>
      </VStack>
    </PageContainer>
  );
};

export default ForgotPasswordPage;
