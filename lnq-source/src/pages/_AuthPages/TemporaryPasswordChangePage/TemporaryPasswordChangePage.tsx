import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Stack,
  InputRightElement,
  InputGroup,
  IconButton,
  Text,
  Center,
  VStack,
  useToast,
  FormErrorMessage,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { useChangeTemporaryPassword } from "../../../api/AuthApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AUTH_PAGES } from "../../../base/router/pages";
import { Logo } from "../../../components/Logo";
import { useValidPasswordAdvance } from "../../../hooks/useValidPasswordAdvance";
import PassConstraint from "../../../components/PassConstraint";
import PageContainer from "../../../components/PageContainer";
import { THEME_COLORS } from "../../../base/theme/foundations/colors";

interface TempPasswordUser {
  email: string;
  accessToken: string;
}

const useTempPasswordUser = () => {
  const queryClient = useQueryClient();
  return useQuery<TempPasswordUser>({
    queryKey: ["tempPasswordUser"],
    queryFn: () => {
      const userData = queryClient.getQueryData<TempPasswordUser>(["tempPasswordUser"]);
      return userData
        ? Promise.resolve(userData)
        : Promise.reject(new Error("No temporary user data found"));
    },
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

const TemporaryPasswordChangePage = (): JSX.Element => {
  const { passwordAdvance, setPasswordAdvance, passwordAdvanceIsValid } =
    useValidPasswordAdvance(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [confirmPassError, setConfirmPassError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: tempUserData, isError: tempUserError } = useTempPasswordUser();
  const { mutateAsync: changeTemporaryPassword, isPending: isLoading } =
    useChangeTemporaryPassword();

  // Función para comparar contraseñas usando useCallback para mejorar rendimiento
  const onComparePassword = useCallback(
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
    if (tempUserError || !tempUserData) {
      toast({
        description: "Session expired. Please login again.",
        status: "warning",
      });
      navigate(AUTH_PAGES.login);
      return;
    }

    setEmail(tempUserData.email);
  }, [tempUserData, tempUserError, navigate, toast]);

  const isButtonDisabled = () => {
    return (
      !currentPassword ||
      passwordAdvanceIsValid[0].text !== "Password Strength: Good" ||
      confirmPassError !== "" ||
      currentPassword === passwordAdvance ||
      isLoading
    );
  };

  const handleSubmit = async () => {
    try {
      if (!email) {
        toast({
          description: "Email not found. Please login again.",
          status: "error",
        });
        return;
      }

      await changeTemporaryPassword({
        email: email,
        currentPassword: currentPassword,
        newPassword: passwordAdvance ?? "",
      });

      queryClient.removeQueries({ queryKey: ["tempPasswordUser"] });

      toast({
        description: "Password updated successfully. Please verify your email.",
        status: "success",
      });

      navigate(AUTH_PAGES.login);
    } catch (error: any) {
      error &&
        toast({
          description: "Failed to update password",
          status: "error",
        });
    }
  };

  return (
    <PageContainer variant="centered-auth">
      <VStack minH="100%">
        <Logo />
        <Card width={488} marginTop={30}>
          <CardBody px={"60px"} borderRadius={"20px"}>
            <Text
              fontSize="24px"
              fontWeight={700}
              align="center"
              mt={2}
              color="brandBlue.800"
            >
              Change Temporary Password
            </Text>
            <Text align="center" color={THEME_COLORS.gray[600]}>
              Your password is temporary and needs to be changed
            </Text>
            <form>
              <Stack spacing={4} mt={8}>
                <FormControl variant="floating">
                  <InputGroup>
                    <Input
                      placeholder="" // leave empty for floating label
                      aria-label="Current Password"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      isDisabled={isLoading}
                    />
                    <FormLabel>Current Password</FormLabel>
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        color="gray.500"
                        aria-label="Show current password"
                        size="lg"
                        style={{ top: "8px", right: "8px" }}
                        icon={showCurrentPassword ? <BsEyeSlash /> : <BsEye />}
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <FormControl
                  variant="floating"
                  isInvalid={currentPassword === passwordAdvance && passwordAdvance !== ""}
                >
                  <InputGroup>
                    <Input
                      placeholder="" // leave empty for floating label
                      aria-label="New Password"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={passwordAdvance ?? ""}
                      onChange={(e) => setPasswordAdvance(e.target.value)}
                      isDisabled={isLoading}
                    />
                    <FormLabel>New Password</FormLabel>
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        color="gray.500"
                        aria-label="Show new password"
                        size="lg"
                        style={{ top: "8px", right: "8px" }}
                        icon={showNewPassword ? <BsEyeSlash /> : <BsEye />}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {currentPassword === passwordAdvance && passwordAdvance !== "" && (
                    <FormErrorMessage>
                      New password must be different from current password
                    </FormErrorMessage>
                  )}
                </FormControl>

                <FormControl variant="floating" isInvalid={Boolean(confirmPassError)}>
                  <InputGroup>
                    <Input
                      placeholder="" // leave empty for floating label
                      aria-label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      isDisabled={isLoading}
                    />
                    <FormLabel>Confirm Password</FormLabel>
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        color="gray.500"
                        aria-label="Show confirm password"
                        size="lg"
                        style={{ top: "8px", right: "8px" }}
                        icon={showConfirmPassword ? <BsEyeSlash /> : <BsEye />}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {confirmPassError && (
                    <FormErrorMessage>{confirmPassError}</FormErrorMessage>
                  )}
                </FormControl>

                <PassConstraint passwordAdvanceIsValid={passwordAdvanceIsValid} />

                <Button
                  my={4}
                  backgroundColor={THEME_COLORS.brandYellow[500]}
                  textColor={THEME_COLORS.brandBlue[800]}
                  isLoading={isLoading}
                  isDisabled={isButtonDisabled()}
                  onClick={() => {
                    handleSubmit();
                  }}
                >
                  Update Password
                </Button>

                <Center flexWrap="wrap">
                  <Text fontSize="sm" color="gray.500" me={1}>
                    Need to log in with a different account?
                  </Text>
                  <ChakraLink
                    as={Link}
                    to={AUTH_PAGES.login}
                    color="brandBlue.800"
                    fontWeight="medium"
                    fontSize="sm"
                    _hover={{ color: "gray.900" }}
                  >
                    Back to Login
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

export default TemporaryPasswordChangePage;
