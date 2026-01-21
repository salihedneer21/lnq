/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  InputRightElement,
  InputGroup,
  IconButton,
  Text,
  Center,
  useToast,
  VStack,
  HStack,
  PinInput,
  PinInputField,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";

import { AUTH_PAGES } from "../../../base/router/pages";

import { AccountStatus } from "../../../types/CurrentUser";
import { useValidEmail } from "../../../hooks/useValidEmail";
import { useValidPassword } from "../../../hooks/useValidPassword";
import { useValidCode } from "../../../hooks/useValidCode";
import { useCountDown } from "../../../hooks/useCountdown";
import {
  useSetAccessTokenFromAuthUser,
  useUserLogin,
  useVerifyEmail,
  useVerifyEmailCode,
} from "../../../api/AuthApi";
import PageContainer from "../../../components/PageContainer";
import { THEME_COLORS } from "../../../base/theme/foundations/colors";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "../../../components/Logo";

const LoginPage = (): JSX.Element => {
  const passwordRef = useRef<HTMLInputElement>(null);
  const { email, setEmail } = useValidEmail(null);
  const { password, setPassword } = useValidPassword("");
  const [showPassword, setShowPassword] = useState(false);
  const { code, setCode } = useValidCode("");
  const [step, setStep] = useState<"login" | "2fa">("login");
  const { seconds, setSeconds, setIsActive } = useCountDown(0);

  const { mutateAsync: loginRequest, isPending: isLoggingIn } = useUserLogin();
  const { mutateAsync: verifyEmail } = useVerifyEmail();
  const { mutateAsync: verifyEmailCode } = useVerifyEmailCode();
  const { mutate: setAccessTokenFromAuthUser } = useSetAccessTokenFromAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["authUser"] });
  }, [queryClient]);

  const toast = useToast();

  const login = () => {
    if (!email) return;
    loginRequest({
      email,
      password,
    })
      .then((response) => {
        if (
          response.user.accountStatus === AccountStatus.TEMPORARY_PASSWORD ||
          response.user.accountStatus === AccountStatus.PENDING_FIRST_LOGIN
        ) {
          toast({
            description: "Your password is temporary and needs to be changed",
            status: "info",
          });

          navigate(AUTH_PAGES.temporaryPassword);
          return;
        }

        if (
          response.user.mfaEnabled === true ||
          response.user.accountStatus === AccountStatus.NEEDS_VERIFICATION
        ) {
          setStep("2fa");
          verifyEmail(email);
        } else {
          toast({ description: response.message, status: "success" });
        }
      })
      .catch((error) => {
        toast({
          description: error.message || "Login failed",
          status: "error",
        });
      });
  };

  const verifyCode = () => {
    if (!email) return;
    if (code?.length === 6) {
      verifyEmailCode({
        email: email,
        code: code,
      }).then((response) => {
        setAccessTokenFromAuthUser();
        toast({ description: response.message, status: "success" });
      });
    }
  };

  const onReSendCode = async () => {
    setSeconds(15);
    setIsActive(true);
    try {
      if (!email) return;
      await verifyEmail(email);
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      toast({ description: error.message, status: "error" });
    }
  };

  return (
    <PageContainer variant="centered-auth">
      <VStack minH="100%">
        <Logo variant="large" mx="auto" mb="49px" />
        <Card width={488}>
          <CardBody px={"60px"}>
            {step === "login" && (
              <>
                <Text as="div" fontSize="xl" align="center" mt={2} color="brandBlue.800">
                  Welcome to
                  <Text fontSize="2xl" fontWeight="bold" color="brandBlue.800">
                    LnQ
                  </Text>
                </Text>
                <form>
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
                        onKeyDown={(e) =>
                          e.key === "Enter" ? passwordRef.current?.focus() : undefined
                        }
                        disabled={isLoggingIn}
                      />
                      <FormLabel>Email</FormLabel>
                    </FormControl>

                    <FormControl variant="floating">
                      <InputGroup>
                        <Input
                          placeholder="" // leave empty for floating label
                          aria-label="Password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDownCapture={(event) =>
                            event.key === "Enter" ? login() : undefined
                          }
                          ref={passwordRef}
                          disabled={isLoggingIn}
                        />
                        <FormLabel>Password</FormLabel>
                        <InputRightElement>
                          <IconButton
                            variant="ghost"
                            color="gray.500"
                            aria-label="Show password"
                            top={"8px"}
                            right={"8px"}
                            size="lg"
                            icon={showPassword ? <BsEyeSlash /> : <BsEye />}
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                    <Flex justify={"flex-end"}>
                      <ChakraLink
                        as={Link}
                        to={AUTH_PAGES.forgotPassword}
                        color="brandBlue.800"
                        fontWeight="medium"
                        fontSize="sm"
                        _hover={{ color: "gray.900" }}
                      >
                        Forgot Password?
                      </ChakraLink>
                    </Flex>
                    <Button
                      my={4}
                      colorScheme="brandYellow"
                      isLoading={isLoggingIn}
                      isDisabled={!email || !password}
                      onClick={login}
                      onKeyDownCapture={(event) =>
                        event.key === "Enter" ? login() : undefined
                      }
                    >
                      Login
                    </Button>
                    <Center flexWrap="wrap">
                      <Text fontSize="sm" color="#3E3F49" me={1}>
                        Don{`'`}t have an account?
                      </Text>
                      <ChakraLink
                        as={Link}
                        to={AUTH_PAGES.register}
                        color="brandBlue.800"
                        fontWeight="medium"
                        fontSize="sm"
                        _hover={{ color: "gray.900" }}
                      >
                        Create an account
                      </ChakraLink>
                    </Center>
                  </Stack>
                </form>
              </>
            )}
            {step === "2fa" && (
              <>
                <Text
                  fontSize="lg"
                  align="center"
                  mt={2}
                  color={THEME_COLORS.brandBlue[800]}
                >
                  We have sent a verification code to {email}. Please enter the code below:
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
                      backgroundColor={THEME_COLORS.yellow[500]}
                      textColor={THEME_COLORS.brandBlue[800]}
                      isLoading={isLoggingIn}
                      isDisabled={!code}
                      onClick={verifyCode}
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
                  </Stack>
                </form>
              </>
            )}
          </CardBody>
        </Card>
      </VStack>
    </PageContainer>
  );
};

export default LoginPage;
