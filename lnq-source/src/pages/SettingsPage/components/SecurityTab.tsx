import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import {
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
} from "@chakra-ui/react";

import { useChangePassword, useUpdateUser, useUserData } from "~/api/UserApi";
import { THEME_COLORS } from "~/base/theme/foundations/colors";
import PassConstraint from "~/components/PassConstraint";
import { useValidPasswordAdvance } from "~/hooks/useValidPasswordAdvance";

const SecurityTab = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const { passwordAdvance, setPasswordAdvance, passwordAdvanceIsValid } =
    useValidPasswordAdvance(null);
  const [confirmPass, setConfirmPass] = useState("");
  const [confirmPassError, setConfirmPassError] = useState("");
  const [showCurrentPassword, setshowCurrentPassword] = useState<boolean>(false);
  const [showPassword, setshowPassword] = useState<boolean>(false);
  const [showCPassword, setshowCPassword] = useState<boolean>(false);
  const { data: currentUser } = useUserData();
  const toast = useToast();

  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutateAsync: changePassword, isPending: isChangingPassword } =
    useChangePassword();

  const change2fa = () => {
    updateUser({
      mfaEnabled: !currentUser?.mfaEnabled,
    })
      .then((_res) => {
        toast({
          title: "2FA changed successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      })
      .catch((err: AxiosError) => {
        toast({
          title: "Error",
          description: err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  };

  const onButtonPress = () => {
    if (!passwordAdvance) return;
    changePassword({
      currentPassword: currentPassword,
      newPassword: passwordAdvance,
    }).then((_res) => {
      toast({
        title: "Password changed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setPasswordAdvance("");
      setCurrentPassword("");
      setConfirmPass("");
    });
  };

  useEffect(() => {
    onComparePassword(confirmPass);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmPass, passwordAdvance]);

  const onComparePassword = (confirmPass: string) => {
    setConfirmPass(confirmPass);
    if (confirmPass === "") {
      setConfirmPassError("");
      return;
    }
    if (confirmPass === passwordAdvance) {
      setConfirmPassError("Passwords match");
    } else {
      setConfirmPassError("New password and confirm password fields must match");
    }
  };

  const handleClickShowCurrentPassword = () => {
    setshowCurrentPassword(!showCurrentPassword);
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
      confirmPassError !== "Passwords match" ||
      !currentPassword ||
      currentPassword === passwordAdvance ||
      isChangingPassword ||
      isUpdating
    );
  };

  return (
    <>
      <Grid mt={20} templateColumns="repeat(3, 1fr)">
        <GridItem textStyle={"h5"}>Two-factor Authentication</GridItem>
        <GridItem
          colSpan={2}
          backgroundColor="darkBlue2.900"
          p={"24px"}
          borderRadius={"16px"}
        >
          <HStack>
            <Text color="white" flex={1}>
              Allow to receive a verification code to the email
              <Text
                as="span"
                fontWeight={"700"}
                color="brandYellow.600"
              >{` ${currentUser?.email} `}</Text>
              at every login to the application
            </Text>
            <Checkbox
              colorScheme="brandYellow"
              isDisabled={isUpdating}
              isChecked={currentUser?.mfaEnabled}
              onChange={() => change2fa()}
            />
          </HStack>
        </GridItem>
      </Grid>
      <Divider my="32px" color="gray.600" />
      <Grid templateColumns="repeat(3, 1fr)">
        <GridItem colSpan={1} textStyle={"h5"}>
          Password
        </GridItem>
        <GridItem as="form" colSpan={2}>
          <Grid gap={6} backgroundColor="darkBlue2.900" p={"24px"} borderRadius="16px">
            {/* Hidden email field supresses DOM warning */}
            <Input
              color="white"
              placeholder="" // leave empty for floating label
              aria-label="Email"
              name="email"
              type="email"
              autoComplete="email"
              display="none"
            />
            <FormControl variant="floating">
              <InputGroup>
                <Input
                  color="white"
                  placeholder=""
                  aria-label="Current Password"
                  name="password"
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={currentPassword}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  onChange={(e: any) => setCurrentPassword(e.target.value as string)}
                  isDisabled={isChangingPassword}
                />
                <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                  Current Password
                </FormLabel>
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    color="#5A65E1"
                    aria-label="Show password"
                    size="lg"
                    style={{ top: "8px", right: "8px" }}
                    icon={showCurrentPassword ? <BsEyeSlash /> : <BsEye />}
                    onClick={handleClickShowCurrentPassword}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl variant="floating">
              <InputGroup>
                <Input
                  color="white"
                  placeholder=""
                  aria-label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={passwordAdvance ?? ""}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  onChange={(e: any) => setPasswordAdvance(e.target.value as string)}
                  isDisabled={isChangingPassword}
                />
                <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                  New Password
                </FormLabel>
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    color="#5A65E1"
                    aria-label="Show password"
                    size="lg"
                    style={{ top: "8px", right: "8px" }}
                    icon={showPassword ? <BsEyeSlash /> : <BsEye />}
                    onClick={handleClickShowPassword}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl variant="floating">
              <InputGroup>
                <Input
                  color="white"
                  placeholder=""
                  aria-label="Confirm Password"
                  name="confirmpassword"
                  type={showCPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPass}
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  onChange={(e: any) => setConfirmPass(e?.target?.value as string)}
                  isDisabled={isChangingPassword}
                />
                <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                  Confirm Password
                </FormLabel>
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    color="#5A65E1"
                    aria-label="Show password"
                    size="lg"
                    style={{ top: "8px", right: "8px" }}
                    icon={showCPassword ? <BsEyeSlash /> : <BsEye />}
                    onClick={handleClickShowCPassword}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <PassConstraint
              confirmPassError={confirmPassError}
              passwordAdvanceIsValid={passwordAdvanceIsValid}
            />
          </Grid>
          <HStack mt={6} justify={"flex-end"}>
            <Button
              onClick={onButtonPress}
              colorScheme="brandYellow"
              textColor="brandBlue.800"
              isLoading={isChangingPassword}
              isDisabled={isButtonDisabled()}
            >
              {isChangingPassword ? "...loading" : "Save changes"}
            </Button>
          </HStack>
        </GridItem>
      </Grid>
    </>
  );
};

export default SecurityTab;
