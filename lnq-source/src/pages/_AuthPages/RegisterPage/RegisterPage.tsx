import type React from "react";

import {
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Center,
  useToast,
  VStack,
  Checkbox,
  Textarea,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  HStack,
  Grid,
  Box,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDownIcon } from "@chakra-ui/icons";

import { AUTH_PAGES } from "../../../base/router/pages";
import { Logo } from "../../../components/Logo";
import { useValidEmail } from "../../../hooks/useValidEmail";
import { useValidName } from "../../../hooks/useValidName";
import { useValidLastName } from "../../../hooks/useValidLastName";
import {
  useCheckEmail,
  useGetAuthUser,
  useSetAuthUser,
  useVerifyPhone,
} from "../../../api/AuthApi";
import { useValidPhoneMask } from "../../../hooks/useValidPhoneMask";
import PageContainer from "../../../components/PageContainer";
import { THEME_COLORS } from "../../../base/theme/foundations/colors";
import Switch from "../../../components/Switch/Switch";

const daysOptions = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

const hoursOptions = [
  { label: "Morning", value: "Morning" },
  { label: "Afternoon", value: "Afternoon" },
  { label: "Evening", value: "Evening" },
  { label: "Overnight", value: "Overnight" },
];

const rvuOptions = [
  { label: "0-200", value: "0-200" },
  { label: "201-500", value: "201-500" },
  { label: "501-1000", value: "501-1000" },
  { label: "1000+", value: "1000+" },
];

const stateOptions = [
  { label: "IMLC licensed", value: "IMLC" },
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  { label: "New Hampshire", value: "NH" },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  { label: "North Carolina", value: "NC" },
  { label: "North Dakota", value: "ND" },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Rhode Island", value: "RI" },
  { label: "South Carolina", value: "SC" },
  { label: "South Dakota", value: "SD" },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  { label: "West Virginia", value: "WV" },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

const specialtyOptions = [
  { label: "Neuroradiology", value: "Neuroradiology" },
  { label: "Musculoskeletal (MSK) Radiology", value: "Musculoskeletal (MSK) Radiology" },
  { label: "Pediatric Radiology", value: "Pediatric Radiology" },
  { label: "Breast Imaging", value: "Breast Imaging" },
  { label: "Cardiothoracic Radiology", value: "Cardiothoracic Radiology" },
  { label: "Body Imaging", value: "Body Imaging" },
  { label: "Emergency Radiology", value: "Emergency Radiology" },
  { label: "Nuclear Radiology", value: "Nuclear Radiology" },
  { label: "Interventional Radiology", value: "Interventional Radiology" },
  { label: "Neurointerventional Radiology", value: "Neurointerventional Radiology" },
];

const RegisterPage = (): JSX.Element => {
  useGetAuthUser();

  const { email, setEmail, emailIsValid } = useValidEmail(null);
  const { firstName, setFirstName, nameIsValid } = useValidName(null);
  const { lastName, setLastName, lastNameIsValid } = useValidLastName(null);
  const { ref, phone, invalidPhoneError, parsedPhone } = useValidPhoneMask("");
  const [providerId, setProviderId] = useState("");
  const [confirmProviderId, setConfirmProviderId] = useState("");
  const [confirmAgreement, setConfirmAgreement] = useState(false);

  const [specialty, setSpecialty] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [availabilityPreferences, setAvailabilityPreferences] = useState({
    days: [] as string[],
    hours: [] as string[],
  });
  const [workTypes, setWorkTypes] = useState({
    weekdays: false,
    weekends: false,
    swingShifts: false,
    overnights: false,
    dedicatedShifts: false,
  });
  const [rvuPerMonth, setRvuPerMonth] = useState("");
  const [stateLicenses, setStateLicenses] = useState<string[]>([]);
  const [hasMalpracticeInsurance, setHasMalpracticeInsurance] = useState<boolean | null>(
    null,
  );

  const { mutateAsync: setAuthUser } = useSetAuthUser();
  const { mutateAsync: checkEmail, isPending: isCheckingEmail } = useCheckEmail();
  const { mutateAsync: verifyPhone, isPending: isVerifyingPhone } = useVerifyPhone();

  const navigate = useNavigate();
  const toast = useToast();

  const isLoading = isCheckingEmail || isVerifyingPhone;

  const validateForm = (): boolean => {
    const hasValidationErrors = [
      emailIsValid,
      nameIsValid,
      lastNameIsValid,
      invalidPhoneError,
    ].some((error) => error !== "");

    const hasEmptyFields = [
      firstName,
      lastName,
      email,
      phone,
      providerId,
      confirmProviderId,
    ].some((field) => !field);

    const npiMismatch = providerId !== confirmProviderId;

    const hasUserInterestValidationErrors =
      !stateLicenses.length || hasMalpracticeInsurance === null;

    return (
      !hasValidationErrors &&
      !hasEmptyFields &&
      !npiMismatch &&
      confirmAgreement &&
      !hasUserInterestValidationErrors
    );
  };

  const handleSubmit = async () => {
    if (!email) {
      toast({ description: "Please enter email", status: "error" });
      return;
    }

    try {
      await checkEmail(email);
      const userData = {
        email,
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        phone: parsedPhone ?? "",
        providerId,
        specialty: specialty ?? "",
        additionalInfo: additionalInfo ?? "",
        availabilityPreferences: {
          days: availabilityPreferences.days ?? [],
          hours: availabilityPreferences.hours ?? [],
        },
        workTypes: {
          weekdays: workTypes.weekdays ?? false,
          weekends: workTypes.weekends ?? false,
          swingShifts: workTypes.swingShifts ?? false,
          overnights: workTypes.overnights ?? false,
          dedicatedShifts: workTypes.dedicatedShifts ?? false,
        },
        rvuPerMonth: rvuPerMonth ?? "",
        stateLicenses: stateLicenses ?? [],
        hasMalpracticeInsurance: hasMalpracticeInsurance ?? false,
      };
      await setAuthUser(userData);
      // Skip phone verification in dev environment
      if (process.env.NODE_ENV === "development") {
        navigate(`${AUTH_PAGES.checkPassword}/signup`);
      } else {
        await verifyPhone({
          phone: parsedPhone ?? "",
          email,
        });
        navigate(AUTH_PAGES.verifyPhone);
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        description: error instanceof Error ? error.message : "Registration failed",
        status: "error",
      });
    }
  };

  const npiMismatchError =
    Boolean(providerId) && Boolean(confirmProviderId) && providerId !== confirmProviderId;

  let malpracticeLabel: string;
  if (hasMalpracticeInsurance === null) {
    malpracticeLabel = "Select an option";
  } else if (hasMalpracticeInsurance) {
    malpracticeLabel = "Yes";
  } else {
    malpracticeLabel = "No";
  }

  const handleMultiSelect = (field: "days" | "hours", value: string): void => {
    const currentValues = availabilityPreferences[field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setAvailabilityPreferences((prev) => ({
      ...prev,
      [field]: newValues,
    }));
  };

  const handleWorkTypeChange = (key: keyof typeof workTypes): void => {
    setWorkTypes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLicenseToggle = (value: string): void => {
    setStateLicenses((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  return (
    <PageContainer variant="centered-auth">
      <VStack minH="100%" spacing={8}>
        <Logo mt={10} />
        <Card width={488}>
          <CardBody px="60px" py="40px" borderRadius="20px">
            <VStack spacing={6}>
              {/* Header */}
              <VStack spacing={2}>
                <Text
                  fontSize="24px"
                  fontWeight={700}
                  textAlign="center"
                  color="brandBlue.800"
                >
                  Create an account
                </Text>
                <Text textAlign="center" color={THEME_COLORS.gray[600]} fontSize="sm">
                  Please fill in all required fields to register
                </Text>
              </VStack>

              {/* Form */}
              <Stack spacing={4} width="100%">
                <FormControl variant="floating">
                  <Input
                    placeholder=""
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName ?? ""}
                    onChange={(e) => setFirstName(e.target.value)}
                    isDisabled={isLoading}
                    isInvalid={nameIsValid !== ""}
                  />
                  <FormLabel>First Name</FormLabel>
                </FormControl>

                <FormControl variant="floating">
                  <Input
                    placeholder=""
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName ?? ""}
                    onChange={(e) => setLastName(e.target.value)}
                    isDisabled={isLoading}
                    isInvalid={lastNameIsValid !== ""}
                  />
                  <FormLabel>Last Name</FormLabel>
                </FormControl>

                <FormControl variant="floating">
                  <Input
                    placeholder=""
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email ?? ""}
                    onChange={(e) => setEmail(e.target.value)}
                    isDisabled={isLoading}
                    isInvalid={emailIsValid !== ""}
                  />
                  <FormLabel>Email</FormLabel>
                </FormControl>

                <FormControl variant="floating">
                  <Input
                    placeholder=""
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    ref={ref as React.RefObject<HTMLInputElement>}
                    isDisabled={isLoading}
                    isInvalid={invalidPhoneError !== ""}
                    onChange={(e) => e.preventDefault()}
                  />
                  <FormLabel>Phone</FormLabel>
                </FormControl>

                <FormControl variant="floating">
                  <Input
                    placeholder=""
                    name="providerId"
                    type="number"
                    value={providerId}
                    onChange={(e) => setProviderId(e.target.value)}
                    isDisabled={isLoading}
                  />
                  <FormLabel>NPI Number</FormLabel>
                </FormControl>

                <FormControl variant="floating" isInvalid={npiMismatchError}>
                  <Input
                    placeholder=""
                    name="confirmProviderId"
                    type="number"
                    value={confirmProviderId}
                    onChange={(e) => setConfirmProviderId(e.target.value)}
                    isDisabled={isLoading}
                  />
                  <FormLabel>Confirm NPI Number</FormLabel>
                </FormControl>

                <FormControl>
                  <Menu closeOnSelect placement="bottom">
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      variant="outline"
                      w="full"
                      textAlign="left"
                      height={14}
                      borderColor="gray.300"
                      fontWeight="400"
                      color={`gray.${specialty ? 800 : 400}`}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {specialtyOptions.find((opt) => opt.value === specialty)?.label ??
                        "Select specialty"}
                    </MenuButton>
                    <MenuList zIndex={1000}>
                      {specialtyOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          onClick={() => setSpecialty(option.value)}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>

                <FormControl>
                  <Text color="gray.500" fontSize="12px" fontWeight="700" mb={4}>
                    We assume physicians are open to ad-hoc/non scheduled work at their
                    affiliated facilities. If you prefer only scheduled work, please
                    indicate this in the free text below.
                  </Text>
                  <Textarea
                    placeholder="Feel free to share any additional information about yourself."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    maxLength={500}
                    height="120px"
                    resize="none"
                    isDisabled={isLoading}
                  />
                </FormControl>

                <FormControl maxW="368px" alignSelf="center">
                  <FormLabel color="gray.500" fontSize="12px" fontWeight="700">
                    Are you interested in any specific hours or days of the week?
                  </FormLabel>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <Menu closeOnSelect={false} placement="bottom">
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        variant="outline"
                        w="full"
                        height={14}
                        textAlign="left"
                        borderColor="gray.300"
                        color={`gray.${availabilityPreferences.days.length ? 800 : 400}`}
                        fontWeight="400"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {availabilityPreferences.days.length
                          ? `${availabilityPreferences.days.length} days selected`
                          : "Days"}
                      </MenuButton>
                      <MenuList>
                        {daysOptions.map((option) => (
                          <MenuItem
                            key={option.value}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMultiSelect("days", option.value);
                            }}
                          >
                            <HStack justify="space-between" width="100%">
                              <Checkbox
                                isChecked={availabilityPreferences.days.includes(
                                  option.value,
                                )}
                                colorScheme="brandBlue"
                              />
                              <Text flex="1">{option.label}</Text>
                            </HStack>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>

                    <Menu closeOnSelect={false} placement="bottom">
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        variant="outline"
                        height={14}
                        w="full"
                        textAlign="left"
                        color={`gray.${availabilityPreferences.hours.length ? 800 : 400}`}
                        fontWeight="400"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {availabilityPreferences.hours.length
                          ? `${availabilityPreferences.hours.length} times selected`
                          : "Hours"}
                      </MenuButton>
                      <MenuList>
                        {hoursOptions.map((option) => (
                          <MenuItem
                            key={option.value}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMultiSelect("hours", option.value);
                            }}
                          >
                            <HStack justify="space-between" width="100%">
                              <Checkbox
                                isChecked={availabilityPreferences.hours.includes(
                                  option.value,
                                )}
                                colorScheme="brandBlue"
                              />
                              <Text color="gray.600" textStyle="smMdSemi" flex="1">
                                {option.label}
                              </Text>
                            </HStack>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </Grid>
                </FormControl>

                <FormControl color="grey.400" maxW="368" alignSelf="center">
                  <FormLabel color="gray.500" fontSize="12px" fontWeight="700">
                    What type of work are you interested in?
                  </FormLabel>
                  <VStack align="stretch">
                    {(Object.keys(workTypes) as (keyof typeof workTypes)[]).map((key) => (
                      <HStack
                        key={key}
                        justify="space-between"
                        alignSelf="center"
                        minW="100%"
                      >
                        <Text textTransform="capitalize">
                          {key.replaceAll("([A-Z])", " $1")}
                        </Text>
                        <Switch
                          isToggled={workTypes[key]}
                          onToggle={() => handleWorkTypeChange(key)}
                          id={`switch-${key}`}
                        />
                      </HStack>
                    ))}
                  </VStack>
                </FormControl>

                <FormControl maxW="368" alignSelf="center">
                  <FormLabel color="gray.500" fontSize="12px" fontWeight="700">
                    How many RVUs per Month are you interested in doing?
                  </FormLabel>
                  <Menu closeOnSelect placement="bottom">
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      variant="outline"
                      w="full"
                      textAlign="left"
                      height={14}
                      borderColor="gray.300"
                      fontWeight="400"
                      color={`gray.${rvuPerMonth ? 800 : 400}`}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {rvuPerMonth || "Select"}
                    </MenuButton>
                    <MenuList>
                      {rvuOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          onClick={() => setRvuPerMonth(option.value)}
                        >
                          <HStack justify="space-between">
                            <Checkbox
                              isChecked={rvuPerMonth === option.value}
                              colorScheme="brandBlue"
                            />
                            <Text color="gray.600" textStyle="smMdSemi" flex="1">
                              {option.label}
                            </Text>
                          </HStack>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>

                <FormControl maxW="368" alignSelf="center" isRequired>
                  <FormLabel color="gray.500" fontSize="12px" fontWeight="700">
                    State medical licensure
                  </FormLabel>
                  <Menu closeOnSelect={false} placement="bottom">
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      variant="outline"
                      height={14}
                      w="full"
                      borderColor="gray.300"
                      textAlign="left"
                      color={stateLicenses?.length ? "gray.600" : "gray.400"}
                      fontWeight="400"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {stateLicenses?.length
                        ? `${stateLicenses.length} states selected`
                        : "Select states"}
                    </MenuButton>
                    <MenuList as={Box} maxHeight="300px" overflowY="auto">
                      {stateOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          onClick={() => handleLicenseToggle(option.value)}
                          _hover={{ bg: "gray.100" }}
                        >
                          <HStack justify="space-between" width="100%">
                            <Checkbox
                              isChecked={stateLicenses?.includes(option.value)}
                              colorScheme="brandBlue"
                              pointerEvents="none"
                            />
                            <Text flex="1">{option.label}</Text>
                          </HStack>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </FormControl>

                <FormControl maxW="368" alignSelf="center" isRequired>
                  <FormLabel color="gray.500" fontSize="12px" fontWeight="700">
                    Do you have your own malpractice insurance?
                  </FormLabel>
                  <Menu closeOnSelect placement="bottom">
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon color="gray.500" />}
                      variant="outline"
                      height={14}
                      w="full"
                      borderColor="gray.300"
                      textAlign="left"
                      color={hasMalpracticeInsurance === null ? "gray.400" : "gray.600"}
                      fontWeight="400"
                      _hover={{ borderColor: "gray.400" }}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {malpracticeLabel}
                    </MenuButton>
                    <MenuList>
                      <MenuItem
                        onClick={() => setHasMalpracticeInsurance(true)}
                        _hover={{ bg: "gray.100" }}
                      >
                        Yes
                      </MenuItem>
                      <MenuItem
                        onClick={() => setHasMalpracticeInsurance(false)}
                        _hover={{ bg: "gray.100" }}
                      >
                        No
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </FormControl>

                <Checkbox
                  colorScheme="brandYellow"
                  size="lg"
                  isChecked={confirmAgreement}
                  onChange={(e) => setConfirmAgreement(e.target.checked)}
                >
                  <Text fontSize="12px" color={THEME_COLORS.gray[600]}>
                    I agree to Terms of Service and Privacy Policy
                  </Text>
                </Checkbox>

                <Button
                  backgroundColor={THEME_COLORS.brandYellow[500]}
                  color={THEME_COLORS.brandBlue[800]}
                  size="lg"
                  isLoading={isLoading}
                  isDisabled={!validateForm()}
                  onClick={() => {
                    handleSubmit();
                  }}
                  _hover={{
                    backgroundColor: THEME_COLORS.brandYellow[600],
                  }}
                >
                  Continue
                </Button>

                <Center>
                  <Text fontSize="sm" color="gray.500" mr={1}>
                    Have an account?
                  </Text>
                  <ChakraLink
                    as={Link}
                    to={AUTH_PAGES.login}
                    color="brandBlue.800"
                    fontWeight="medium"
                    fontSize="sm"
                    _hover={{ color: "gray.900" }}
                  >
                    Login
                  </ChakraLink>
                </Center>
              </Stack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </PageContainer>
  );
};

export default RegisterPage;
