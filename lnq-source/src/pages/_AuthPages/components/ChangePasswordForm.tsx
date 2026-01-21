import { useMemo, useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
} from "@chakra-ui/react";

import PassConstraint from "~/components/PassConstraint";

interface Props {
  passwordAdvance: string | null;
  setPasswordAdvance: (passwordAdvance: string | null) => void;
  loading: boolean;
  confirmPass: string;
  setConfirmPass: (confirmPass: string) => void;
  passwordAdvanceIsValid: { active: boolean; text: string }[];
  isButtonDisabled: () => boolean;
  onButtonPressed: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    option: "setEmail" | "setCode" | "createPass" | "resendCode",
  ) => Promise<void>;
  onBackPressed: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  setCurrentPassword?: (passwordAdvance: string) => void;
  currentPassword?: string;
}

const ChangePasswordForm: React.FC<Props> = ({
  passwordAdvance,
  setPasswordAdvance,
  loading,
  confirmPass,
  setConfirmPass,
  passwordAdvanceIsValid,
  isButtonDisabled,
  onButtonPressed,
  onBackPressed,
  currentPassword,
  setCurrentPassword,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const isSamePasswordError = useMemo(() => {
    if (!setCurrentPassword) {
      return false;
    }
    return Boolean(
      currentPassword && passwordAdvance && currentPassword === passwordAdvance,
    );
  }, [currentPassword, passwordAdvance, setCurrentPassword]);

  const passwordMatchError = useMemo(() => {
    return Boolean(passwordAdvance && confirmPass && passwordAdvance !== confirmPass);
  }, [confirmPass, passwordAdvance]);

  return (
    <>
      <Text fontSize="lg" align="center" mt={2} color="brandBlue.800">
        Create password
      </Text>
      <Text fontSize="md" align="center" mt={2} color="gray">
        Your new password must be different from the previous one
      </Text>
      <Stack spacing={4} mt={8}>
        {setCurrentPassword ? (
          <FormControl variant="floating">
            <InputGroup>
              <Input
                placeholder="" // leave empty for floating label
                aria-label="Current Password"
                autoComplete="current-password"
                name="currentpassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword ?? ""}
                onChange={(e) => setCurrentPassword?.(e.target.value)}
                isDisabled={loading}
              />
              <FormLabel>Current Password</FormLabel>
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  color="gray.500"
                  aria-label="Show password"
                  size="lg"
                  style={{ top: "8px", right: "8px" }}
                  icon={showCurrentPassword ? <BsEyeSlash /> : <BsEye />}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
        ) : null}
        <FormControl variant="floating" isInvalid={isSamePasswordError}>
          <InputGroup>
            <Input
              placeholder="" // leave empty for floating label
              aria-label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={passwordAdvance ?? ""}
              onChange={(e) => setPasswordAdvance(e.target.value)}
              isDisabled={loading}
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
                onClick={() => setShowPassword(!showPassword)}
              />
            </InputRightElement>
          </InputGroup>
          {isSamePasswordError && (
            <FormErrorMessage>
              Password must be different than current one.
            </FormErrorMessage>
          )}
        </FormControl>
        <FormControl variant="floating" isInvalid={passwordMatchError}>
          <InputGroup>
            <Input
              placeholder="" // leave empty for floating label
              aria-label="Confirm Password"
              name="confirmpassword"
              autoComplete="new-password"
              type={showCPassword ? "text" : "password"}
              required
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              isDisabled={loading}
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
                onClick={() => setShowCPassword(!showCPassword)}
              />
            </InputRightElement>
          </InputGroup>
          {passwordMatchError && (
            <FormErrorMessage>Passwords do not match.</FormErrorMessage>
          )}
        </FormControl>
        <PassConstraint passwordAdvanceIsValid={passwordAdvanceIsValid} />
        <Button
          my={4}
          backgroundColor="brandYellow.500"
          textColor="brandYellow.800"
          isLoading={loading}
          isDisabled={isButtonDisabled() || isSamePasswordError || passwordMatchError}
          onClick={(e) => void onButtonPressed(e, "createPass")}
        >
          Done
        </Button>
        <Button
          variant={"ghost"}
          isLoading={loading}
          //   isDisabled={isButtonDisabled()}
          onClick={onBackPressed}
        >
          Back
        </Button>
      </Stack>
    </>
  );
};

export default ChangePasswordForm;
