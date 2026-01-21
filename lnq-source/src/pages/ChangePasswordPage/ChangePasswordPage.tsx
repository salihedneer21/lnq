import { VStack, Card, CardBody, useToast, Input } from "@chakra-ui/react";
import PageContainer from "../../components/PageContainer";
import ChangePasswordForm from "../_AuthPages/components/ChangePasswordForm";
import { Logo } from "../../components/Logo";
import { useState } from "react";
import { useValidPasswordAdvance } from "../../hooks/useValidPasswordAdvance";
import { useNavigate } from "react-router-dom";
import { AUTH_PAGES, PROVIDER_PAGES } from "../../base/router/pages";
import { useChangePassword } from "../../api/UserApi";
import { useSignOut } from "../../api/AuthApi";

const ChangePasswordPage: React.FC = () => {
  const [confirmPass, setConfirmPass] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const { passwordAdvance, setPasswordAdvance, passwordAdvanceIsValid } =
    useValidPasswordAdvance(null);
  const { mutateAsync: changePassword, isPending: isChangingPassword } =
    useChangePassword();
  const toast = useToast();
  const navigate = useNavigate();
  const { mutateAsync: reset } = useSignOut();

  const onBackPressed = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    reset();
    navigate(AUTH_PAGES.login);
  };

  const onButtonPressed = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    _option: "setEmail" | "setCode" | "createPass" | "resendCode",
  ) => {
    e.stopPropagation();
    try {
      if (!passwordAdvance) return;
      await changePassword({
        currentPassword: currentPassword,
        newPassword: passwordAdvance,
      });
      toast({ description: "Password changed successfully", status: "success" });
      navigate(PROVIDER_PAGES.home);
    } catch (error: any) {
      setConfirmPass("");
      setPasswordAdvance("");
      setCurrentPassword("");
    }
  };

  const isButtonDisabled = () => {
    return !passwordAdvanceIsValid.some(
      (value) => value.text === "Password Strength: Good",
    );
  };

  return (
    <PageContainer variant="centered-auth">
      <VStack minH="100%">
        <Logo mx="auto" />
        <Card width={488} marginTop={30}>
          <CardBody paddingLeft={"60px"} paddingRight={"60px"} borderRadius={"20px"}>
            <form>
              {/* Hidden email field supresses DOM warning */}
              <Input
                placeholder="" // leave empty for floating label
                aria-label="Email"
                name="email"
                type="email"
                autoComplete="email"
                display="none"
              />
              <ChangePasswordForm
                confirmPass={confirmPass}
                isButtonDisabled={isButtonDisabled}
                loading={isChangingPassword}
                onBackPressed={onBackPressed}
                onButtonPressed={onButtonPressed}
                passwordAdvance={passwordAdvance}
                passwordAdvanceIsValid={passwordAdvanceIsValid}
                setConfirmPass={setConfirmPass}
                setPasswordAdvance={setPasswordAdvance}
                setCurrentPassword={setCurrentPassword}
                currentPassword={currentPassword}
              />
            </form>
          </CardBody>
        </Card>
      </VStack>
    </PageContainer>
  );
};

export default ChangePasswordPage;
