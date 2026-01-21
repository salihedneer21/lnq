import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  Text,
  Textarea,
  useDisclosure,
  Select,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { RefObject, useEffect, useRef } from "react";
import { PROVIDER_PAGES } from "../../base/router/pages";
import { useEditGroup, useGetGroup, useSetGroupPayoutEnabled } from "../../api/GroupApi";
import { THEME_COLORS } from "../../base/theme/foundations/colors";
import { useValidPhoneMask } from "../../hooks/useValidPhoneMask";
import ModalContainer from "../../components/ModalContainer/ModalContainer";
import { timeZoneOptions } from "../../utils/timeZones.ts";
import usePayment from "../../hooks/usePayment.ts";
import useFormWithSchema from "../../hooks/useFormWithSchema.ts";
import { editGroupSchema } from "./validation.ts";
import _ from "lodash";
import { PaymentOptions } from "./Payment/PaymentOptions.tsx";
import Switch from "../../components/Switch/Switch.tsx";

export const EditGroupPage = () => {
  const { groupId } = useParams();
  const { data, isSuccess } = useGetGroup(groupId);
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const stripePayment = useRef<RefObject<ReturnType<typeof usePayment>>>(null);

  const { mutate: editGroup, isPending: isEditingGroup } = useEditGroup();

  const { mutateAsync: togglePayoutEnabledMutationAsync, isPending } =
    useSetGroupPayoutEnabled();

  const navigate = useNavigate();

  const { ref, phone, invalidPhoneError, parsedPhone, setInitialPhoneValue } =
    useValidPhoneMask(data?.group?.phone ?? "");
  const groupForm = useFormWithSchema(
    editGroupSchema,
    (val) => {
      const handlePayment = () =>
        stripePayment.current?.current?.setupPayment?.(
          data!.group.id,
          () => {
            navigate(PROVIDER_PAGES.groups);
          },
          (err) => {
            console.error(err);
          },
        );
      const hasChanges = !_.isEqual(val, {
        id: data?.group.id,
        email: data?.group.email,
        facilityName: data?.group.facilityName,
        timeZone: data?.group.timeZone,
        description: data?.group.description,
        phone: data?.group.phone,
        rvuRateVisible: data?.group.rvuRateVisible ?? false,
      });

      if (!hasChanges) {
        handlePayment();
        return;
      }

      editGroup({ ...val, phone: parsedPhone } as Required<typeof val>, {
        onSuccess: () => {
          toast({
            description: "Settings saved successfully",
            status: "success",
          });
          handlePayment();
        },
        onError: (error) => {
          toast({
            description: error.message || "Failed to save settings",
            status: "error",
          });
        },
      });
    },
    {
      id: groupId,
      email: "",
      facilityName: "",
      timeZone: "",
      description: "",
      phone: "",
      rvuRateVisible: false,
    },
  );

  useEffect(() => {
    if (isSuccess && data) {
      groupForm.setValues({
        id: data.group.id,
        email: data.group.email,
        facilityName: data.group.facilityName,
        timeZone: data.group.timeZone,
        description: data.group.description,
        phone: data.group.phone,
        rvuRateVisible: data.group.rvuRateVisible ?? false,
      });
      setInitialPhoneValue(data.group.phone ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, data]);

  const isButtonDisabled =
    Object.keys(groupForm.errors).length > 0 ||
    invalidPhoneError.length > 0 ||
    isEditingGroup;
  const handleConfirm = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOnCancel = () => {
    navigate(PROVIDER_PAGES.groups);
  };
  const handleNavigateBack = () => {
    navigate(PROVIDER_PAGES.groups);
  };

  const handleOnSave = () => groupForm.handleSubmit();

  const handleGroupPayoutEnabledToggle = async () => {
    if (!data?.group.id) {
      toast({
        description:
          "Group was not retrieved. Either reload the page or come renavigate to this group",
        status: "error",
      });

      return;
    }
    const response = await togglePayoutEnabledMutationAsync({
      id: data?.group.id,
      payoutEnabled: !data?.group?.payoutEnabled,
    });
    toast({ description: response.message, status: "success" });
  };
  const paymentOptions = (data?.paymentOptions ?? []).filter((option) =>
    ["card", "us_bank_account"].includes(option.type),
  );

  return (
    <>
      <Box mt={"24px"}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="link"
          onClick={handleNavigateBack}
          color="white"
        >
          Groups
        </Button>
        <Text fontSize="3xl" fontWeight="700" color="white">
          Edit Group
        </Text>
      </Box>
      <>
        <Grid mt={20} templateColumns="repeat(3, 1fr)">
          <GridItem textStyle="h5">Group Information</GridItem>
          <GridItem
            colSpan={2}
            backgroundColor="darkBlue2.900"
            p="24px"
            borderRadius="16px"
          >
            <Grid gap={4}>
              <FormControl variant="floating">
                <Input
                  color="white"
                  placeholder=""
                  aria-label="Group name"
                  name="groupName"
                  type="text"
                  required
                  value={groupForm.values.facilityName}
                  isInvalid={!!groupForm.errors?.facilityName}
                  onChange={(event) => {
                    groupForm.setFieldValue("facilityName", event.target.value);
                  }}
                />
                <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                  Group name
                </FormLabel>
              </FormControl>
              <FormControl variant="floating">
                <Input
                  color="white"
                  placeholder=""
                  aria-label="Phone"
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  value={phone}
                  ref={ref as React.RefObject<HTMLInputElement>}
                  isInvalid={invalidPhoneError !== ""}
                  onChange={(e) => {
                    e.preventDefault();
                    groupForm.setFieldValue("phone", e.target.value);
                  }}
                />
                <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                  Phone
                </FormLabel>
              </FormControl>
              <FormControl variant="floating">
                <Input
                  color="white"
                  placeholder=""
                  aria-label="Email"
                  name="email"
                  type="email"
                  required
                  inputMode="email"
                  value={groupForm.values.email}
                  isInvalid={!!groupForm.errors?.email}
                  onChange={(event) => {
                    groupForm.setFieldValue("email", event.target.value);
                  }}
                />
                <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                  Email
                </FormLabel>
              </FormControl>
              <FormControl variant="floating">
                <Textarea
                  color="white"
                  placeholder=""
                  aria-label="Description"
                  name="description"
                  required
                  value={groupForm.values.description}
                  isInvalid={!!groupForm.errors?.description}
                  onChange={(event) => {
                    groupForm.setFieldValue("description", event.target.value);
                  }}
                />
                <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                  Description
                </FormLabel>
              </FormControl>
              <FormControl>
                <Text
                  color="brandYellow.500"
                  onClick={onOpen}
                  cursor="pointer"
                  mt={4}
                  fontWeight={700}
                >
                  {groupForm.values.timeZone
                    ? timeZoneOptions.find(
                        ({ value }) => value === groupForm.values.timeZone,
                      )?.label ?? "Select Time Zone"
                    : "Select Time Zone"}
                </Text>
              </FormControl>
            </Grid>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Text textStyle="body" fontSize="s" pt={4}>
                Show Group RVU Performance Data to Non-Members
              </Text>
              <Switch
                isToggled={groupForm.values.rvuRateVisible ?? false}
                onToggle={() => {
                  groupForm.setFieldValue(
                    "rvuRateVisible",
                    !groupForm.values.rvuRateVisible,
                  );
                }}
              />
            </Box>
          </GridItem>
        </Grid>
        <HStack mt={6} spacing={4} justify="flex-end">
          <Button
            variant="outline"
            color="white"
            onClick={handleOnCancel}
            isDisabled={isEditingGroup}
          >
            Cancel
          </Button>
          <Button
            colorScheme="brandYellow"
            color="brandBlue.800"
            onClick={handleOnSave}
            isDisabled={isButtonDisabled}
            isLoading={isEditingGroup}
          >
            Save changes
          </Button>
        </HStack>
        <Grid mt="6" templateColumns="repeat(3, 1fr)">
          <GridItem textStyle="h5">Payment</GridItem>

          <GridItem
            backgroundColor="darkBlue2.900"
            p={"24px"}
            borderRadius={"16px"}
            colSpan={2}
            filter="auto"
          >
            <HStack
              flex="1"
              as="button"
              pb="5"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexGrow="1"
              w="100%"
            >
              <GridItem>
                <Text textStyle="bodyBold" fontSize="lg">
                  Pay now (option for all providers)
                </Text>
              </GridItem>
              <GridItem>
                <Switch
                  isToggled={data?.group.payoutEnabled ?? false}
                  disabled={isPending}
                  onToggle={() => {
                    handleGroupPayoutEnabledToggle();
                  }}
                />
              </GridItem>
            </HStack>
            <Divider mb="8" w="99%" mx="auto" />

            <PaymentOptions
              groupId={data?.group?.id ?? ""}
              preferredPaymentMethodId={data?.group.preferredPaymentMethodId}
              paymentOptions={paymentOptions}
            />
          </GridItem>
        </Grid>
      </>
      <ModalContainer
        isOpen={isOpen}
        onClose={handleCancel}
        title="Time Zone"
        subtitle="Enter your time zone"
        leftButtonTitle="Cancel"
        rightButtonTitle="Confirm"
        onClickLeftButton={handleCancel}
        onClickRightButton={handleConfirm}
        width="530px"
      >
        <Select
          mt={3}
          mb={3}
          placeholder="Select time zone"
          color="white"
          value={groupForm.values.timeZone}
          onChange={(event) => {
            groupForm.setFieldValue("timeZone", event.target.value);
          }}
          sx={{
            option: {
              backgroundColor: "gray.700",
              color: "white",
            },
            "option:checked": {
              backgroundColor: "brandYellow",
              color: THEME_COLORS.gray[200],
            },
          }}
        >
          {timeZoneOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </ModalContainer>
    </>
  );
};
