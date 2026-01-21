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
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useCreateGroup } from "../../api/GroupApi";
import { PROVIDER_PAGES } from "../../base/router/pages";
import { THEME_COLORS } from "../../base/theme/foundations/colors";
import { useValidPhoneMask } from "../../hooks/useValidPhoneMask";
import ModalContainer from "../../components/ModalContainer/ModalContainer";
import { timeZoneOptions } from "../../utils/timeZones.ts";
import useFormWithSchema from "../../hooks/useFormWithSchema.ts";
import { createGroupSchema } from "./validation.ts";

export const CreateGroupPage = () => {
  const { ref, phone, invalidPhoneError, parsedPhone } = useValidPhoneMask("");

  const groupForm = useFormWithSchema(
    createGroupSchema,
    (val) => {
      createGroup({ ...val, phone: parsedPhone } as Required<typeof val>, {
        onSuccess: (data) => {
          navigate(`${PROVIDER_PAGES.groups}/edit/${data.group.id}`);
        },
      });
    },
    {
      email: "",
      facilityName: "",
      timeZone: "",
      description: "",
      phone: "",
    },
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const navigateBack = () => {
    navigate(PROVIDER_PAGES.groups);
  };

  const { mutate: createGroup, isPending: isCreatingGroup } = useCreateGroup();

  const onButtonPress = groupForm.handleSubmit;

  const isButtonDisabled =
    Object.keys(groupForm.errors).length > 0 ||
    invalidPhoneError.length > 0 ||
    isCreatingGroup;

  const handleConfirm = () => {
    onClose();
  };

  return (
    <>
      <Box mt={"24px"}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="link"
          onClick={navigateBack}
          color="white"
        >
          Groups
        </Button>
        <Text fontSize="3xl" fontWeight="700" color="white">
          New Group
        </Text>
      </Box>
      <>
        <Grid mt={20} templateColumns="repeat(3, 1fr)">
          <GridItem textStyle="h5">Group Information</GridItem>
          <GridItem
            colSpan={2}
            backgroundColor="darkBlue2.900"
            p={"24px"}
            borderRadius={"16px"}
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
          </GridItem>
        </Grid>
        <HStack mt={16} spacing={4} justify={"flex-end"}>
          <Button
            variant="outline"
            color="white"
            onClick={navigateBack}
            isDisabled={isCreatingGroup}
          >
            Cancel
          </Button>
          <Button
            colorScheme="brandYellow"
            textColor="brandBlue.800"
            onClick={() => onButtonPress()}
            isDisabled={isButtonDisabled}
            isLoading={isCreatingGroup}
          >
            Create group
          </Button>
        </HStack>
      </>
      <ModalContainer
        isOpen={isOpen}
        onClose={onClose}
        title="Time Zone"
        subtitle="Enter your time zone"
        leftButtonTitle="Cancel"
        rightButtonTitle="Confirm"
        onClickLeftButton={onClose}
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
