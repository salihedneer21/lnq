import React, { useEffect, useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link as ChakraLink,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";

import {
  useGetAuthUser,
  useSetAccessTokenFromAuthUser,
  useUserRegistration,
} from "~/api/AuthApi";
import { AUTH_PAGES, PASSWORD_TYPE, PROVIDER_PAGES } from "~/base/router/pages";
import { Logo } from "~/components/Logo";
import PageContainer from "~/components/PageContainer";
import PassConstraint from "~/components/PassConstraint";
import { useValidPasswordAdvance } from "~/hooks/useValidPasswordAdvance";

export const CheckPasswordPage = (): JSX.Element => {
  const { passwordAdvance, setPasswordAdvance, passwordAdvanceIsValid } =
    useValidPasswordAdvance(null);
  const [confirmPass, setConfirmPass] = useState("");
  const [confirmPassError, setConfirmPassError] = useState("");
  const [showPassword, setshowPassword] = useState<boolean>(false);
  const [showCPassword, setshowCPassword] = useState<boolean>(false);
  const { data: authUser } = useGetAuthUser();
  const { type }: any = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const onComparePassword = React.useCallback(
    (confirmPass: string) => {
      setConfirmPass(confirmPass);
      if (confirmPass === "") {
        setConfirmPassError("");
        return;
      }
      if (confirmPass === passwordAdvance) {
        setConfirmPassError("");
      } else {
        setConfirmPassError("The passwords you have entered don't match");
      }
    },
    [passwordAdvance],
  );

  useEffect(() => {
    onComparePassword(confirmPass);
  }, [confirmPass, onComparePassword]);

  useEffect(() => {
    switch (type) {
      case PASSWORD_TYPE.invite:
        if (!authUser?.email) navigate(AUTH_PAGES.login);
        break;
      case PASSWORD_TYPE.signup:
        if (!authUser?.firstName || !authUser?.lastName || !authUser?.email)
          navigate(AUTH_PAGES.register);
        break;
    }
  }, [authUser, navigate, type]);

  const { mutateAsync: register, isPending: isRegistering } = useUserRegistration();
  const { mutateAsync: setAccessTokenFromAuthUser } = useSetAccessTokenFromAuthUser();

  const onNextPressed = async () => {
    if (!passwordAdvance) {
      toast({ description: "Please enter password", status: "error" });
      return;
    }

    if (!confirmPass) {
      toast({ description: "Please confirm password", status: "error" });
      return;
    }

    if (passwordAdvance !== confirmPass) {
      toast({ description: "Passwords do not match", status: "error" });
      return;
    }

    if (passwordAdvance.length < 8) {
      toast({ description: "Password must be at least 8 characters", status: "error" });
      return;
    }

    if (
      !authUser?.firstName ||
      !authUser?.lastName ||
      !authUser?.email ||
      !authUser?.providerId ||
      !authUser?.phone
    ) {
      toast({ description: "Missing required user data", status: "error" });
      return;
    }

    try {
      const userData = {
        firstName: authUser.firstName,
        lastName: authUser.lastName,
        email: authUser.email,
        providerId: authUser.providerId,
        phone: authUser.phone,
        password: passwordAdvance,
        specialty: authUser.specialty,
        additionalInfo: authUser.additionalInfo,
        availabilityPreferences: authUser.availabilityPreferences,
        workTypes: authUser.workTypes,
        rvuPerMonth: authUser.rvuPerMonth,
        stateLicenses: authUser.stateLicenses,
        hasMalpracticeInsurance: authUser.hasMalpracticeInsurance ?? false,
      } as const;

      await register(userData);
      await setAccessTokenFromAuthUser();
      navigate(PROVIDER_PAGES.home);
    } catch (error) {
      toast({
        description: (error as Error).message || "An unexpected error occurred",
        status: "error",
      });
    }
  };

  const handleClickShowPassword = () => {
    setshowPassword(!showPassword);
  };

  const handleClickShowCPassword = () => {
    setshowCPassword(!showCPassword);
  };

  const isButtonDisabled = () => {
    return (
      passwordAdvanceIsValid[0].text !== "Password Strength: Good" ||
      confirmPassError !== "" ||
      isRegistering
    );
  };

  return (
    <PageContainer variant="centered-auth">
      <VStack minH="100%">
        <Logo />
        <Card width={488} marginTop={30}>
          <CardBody paddingLeft={"60px"} paddingRight={"60px"} borderRadius={"20px"}>
            <Text fontSize="md" align="center" mt={2} color="gray">
              Create a password
            </Text>
            <form>
              <Stack spacing={4} mt={8}>
                <FormControl variant="floating">
                  <InputGroup>
                    <Input
                      placeholder="" // leave empty for floating label
                      aria-label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={passwordAdvance ?? ""}
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      onChange={(e: any) => setPasswordAdvance(e.target.value as string)}
                      disabled={isRegistering}
                    />
                    <FormLabel>Password</FormLabel>
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        color="gray.500"
                        aria-label="Show password"
                        size="lg"
                        style={{ top: "8px", right: "8px" }}
                        icon={showPassword ? <BsEyeSlash /> : <BsEye />}
                        onClick={handleClickShowPassword}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl variant="floating" isInvalid={Boolean(confirmPassError)}>
                  <InputGroup>
                    <Input
                      placeholder="" // leave empty for floating label
                      aria-label="Confirm Password"
                      name="confirmpassword"
                      type={showCPassword ? "text" : "password"}
                      required
                      value={confirmPass}
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      onChange={(e: any) => setConfirmPass(e?.target?.value as string)}
                      disabled={isRegistering}
                    />
                    <FormLabel>Confirm Password</FormLabel>
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        color="gray.500"
                        aria-label="Show password"
                        size="lg"
                        style={{ top: "8px", right: "8px" }}
                        icon={showCPassword ? <BsEyeSlash /> : <BsEye />}
                        onClick={handleClickShowCPassword}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{confirmPassError}</FormErrorMessage>
                </FormControl>
                <PassConstraint passwordAdvanceIsValid={passwordAdvanceIsValid} />
                <Button
                  my={4}
                  backgroundColor={"brandYellow.500"}
                  textColor={"brandBlue.800"}
                  isLoading={isRegistering}
                  isDisabled={isButtonDisabled()}
                  onClick={() => void onNextPressed()}
                >
                  Continue
                </Button>
                <Center flexWrap="wrap">
                  <Text fontSize="sm" color="gray.500" me={1}>
                    Have an account?
                  </Text>
                  <ChakraLink
                    as={Link}
                    to={AUTH_PAGES.login}
                    color="gray.600"
                    fontWeight="medium"
                    fontSize="sm"
                    _hover={{ color: "gray.900" }}
                  >
                    Login
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
