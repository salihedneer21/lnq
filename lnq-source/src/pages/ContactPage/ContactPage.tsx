import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { IconType } from "react-icons";
import { FiUpload, FiX } from "react-icons/fi";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Icon,
  Input,
  Progress,
  Select,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";

import { useSubmitContactForm } from "../../api/ContactApi";
import { useGetMyGroups } from "../../api/GroupApi";
import { useUserData } from "../../api/UserApi";
import { THEME_COLORS } from "../../base/theme/foundations/colors";
import {
  SupportTicketCategory,
  SupportTicketContactMethod,
  SupportTicketPriority,
} from "../../types/Support";

interface ContactFormData {
  facilityGroup: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  preferredContactMethod: string;
  attachments: File[];
}

type ContactFormErrors = Record<string, string>;

const CATEGORIES = [
  { value: SupportTicketCategory.TECHNICAL_ISSUE, label: "Technical Issue" },
  { value: SupportTicketCategory.ACCOUNT_ACCESS, label: "Account Access" },
  { value: SupportTicketCategory.BILLING, label: "Billing" },
  { value: SupportTicketCategory.FEATURE_REQUEST, label: "Feature Request" },
  { value: SupportTicketCategory.OTHER, label: "Other" },
];

const PRIORITIES = [
  { value: SupportTicketPriority.LOW, label: "Low" },
  { value: SupportTicketPriority.MEDIUM, label: "Medium" },
  { value: SupportTicketPriority.HIGH, label: "High" },
  { value: SupportTicketPriority.URGENT, label: "Urgent" },
];

const CONTACT_METHODS = [
  { value: SupportTicketContactMethod.EMAIL, label: "Email" },
  { value: SupportTicketContactMethod.PHONE, label: "Phone" },
  { value: SupportTicketContactMethod.IN_APP, label: "In-App" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
};

const INITIAL_FORM_DATA: ContactFormData = {
  facilityGroup: "",
  category: SupportTicketCategory.TECHNICAL_ISSUE,
  priority: SupportTicketPriority.MEDIUM,
  subject: "",
  description: "",
  preferredContactMethod: SupportTicketContactMethod.EMAIL,
  attachments: [],
};

export const ContactPage = () => {
  const toast = useToast();
  const { data: userData } = useUserData();
  const { data: myGroupsData } = useGetMyGroups(1, 10);
  const { mutateAsync: submitContactForm } = useSubmitContactForm();

  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA);

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: ContactFormErrors = {};

    if (!formData.facilityGroup) {
      newErrors.facilityGroup = "Facility/Group name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length > 100) {
      newErrors.subject = "Subject must be 100 characters or less";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        toast({
          title: "File Upload Error",
          description:
            "Some files were rejected. Please check file size (max 10MB) and format requirements.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...acceptedFiles],
      }));

      for (const file of acceptedFiles) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      }
    },
    [toast],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const removeFile = (fileToRemove: File) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((file) => file !== fileToRemove),
    }));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileToRemove.name];
      return newProgress;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append(
        "name",
        `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim(),
      );
      submitData.append("email", userData?.email ?? "");

      for (const [key, value] of Object.entries(formData)) {
        if (key === "attachments") {
          for (const file of value as File[]) {
            submitData.append("attachments", file);
          }
        } else {
          submitData.append(key, value as string);
        }
      }

      await submitContactForm(submitData);

      toast({
        title: "Success",
        description:
          "Your ticket has been submitted successfully. Our team will reach out shortly.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData(INITIAL_FORM_DATA);
      setUploadProgress({});
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error submitting your ticket. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setUploadProgress({});
  };

  return (
    <>
      <Grid mt={20} gap={2} templateColumns="repeat(3, 1fr)">
        <GridItem>
          <Text fontSize="34px" fontWeight="bold" color="white" mb={6}>
            Contact Us
          </Text>
          <Text fontSize="18px" color="white">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as
            soon as possible.
          </Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Grid gap={6} backgroundColor="darkBlue2.900" p={"24px"} borderRadius="16px">
            <FormControl variant="floating" isInvalid={!!errors.facilityGroup} isRequired>
              {myGroupsData?.docs && myGroupsData.docs.length > 0 ? (
                <>
                  <Select
                    value={formData.facilityGroup}
                    onChange={(e) => handleInputChange("facilityGroup", e.target.value)}
                    color="white"
                    bg="darkBlue2.900"
                    borderColor="gray.600"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: "brandYellow.600" }}
                    sx={{
                      option: {
                        backgroundColor: "darkBlue2.900",
                        color: "white",
                      },
                    }}
                  >
                    <option value="" style={{ backgroundColor: "darkBlue2.900" }}>
                      Select your facility/group
                    </option>
                    {myGroupsData.docs.map((group) => (
                      <option key={group.id} value={group.facilityName}>
                        {group.facilityName}
                      </option>
                    ))}
                  </Select>
                  <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                    Facility/Group Name
                  </FormLabel>
                </>
              ) : (
                <>
                  <Input
                    value={formData.facilityGroup}
                    onChange={(e) => handleInputChange("facilityGroup", e.target.value)}
                    color="white"
                    bg="darkBlue2.900"
                    borderColor="gray.600"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: "brandYellow.600" }}
                  />
                  <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                    Facility/Group Name
                  </FormLabel>
                </>
              )}
              {errors.facilityGroup && (
                <Text color="red.400" fontSize="sm" mt={1}>
                  {errors.facilityGroup}
                </Text>
              )}
            </FormControl>

            <HStack spacing={4}>
              <FormControl variant="floating" isInvalid={!!errors.category} isRequired>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  color="white"
                  bg="darkBlue2.900"
                  borderColor="gray.600"
                  _hover={{ borderColor: "gray.500" }}
                  _focus={{ borderColor: "brandYellow.600" }}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
                <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                  Category
                </FormLabel>
                {errors.category && (
                  <Text color="red.400" fontSize="sm" mt={1}>
                    {errors.category}
                  </Text>
                )}
              </FormControl>

              <FormControl variant="floating" isInvalid={!!errors.priority} isRequired>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  color="white"
                  bg="darkBlue2.900"
                  borderColor="gray.600"
                  _hover={{ borderColor: "gray.500" }}
                  _focus={{ borderColor: "brandYellow.600" }}
                  sx={{
                    option: {
                      backgroundColor: "darkBlue2.900",
                      color: "white",
                    },
                  }}
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </Select>
                <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                  Priority
                </FormLabel>
                {errors.priority && (
                  <Text color="red.400" fontSize="sm" mt={1}>
                    {errors.priority}
                  </Text>
                )}
              </FormControl>
            </HStack>

            <FormControl variant="floating" isInvalid={!!errors.subject} isRequired>
              <Input
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                maxLength={100}
                color="white"
                bg="darkBlue2.900"
                borderColor="gray.600"
                placeholder="Briefly Describe Your Request"
                _hover={{ borderColor: "gray.500" }}
                _focus={{ borderColor: "brandYellow.600" }}
              />
              <FormLabel
                style={{
                  backgroundColor: THEME_COLORS.darkBlue2[900],
                  transform: "scale(0.85) translateY(-30px)",
                }}
              >
                Subject
              </FormLabel>
              <HStack justify="space-between" mt={1}>
                {errors.subject ? (
                  <Text color="red.400" fontSize="sm">
                    {errors.subject}
                  </Text>
                ) : (
                  <Box />
                )}
                <Text color="gray.400" fontSize="sm">
                  {formData.subject.length}/100
                </Text>
              </HStack>
            </FormControl>

            <FormControl variant="floating" isInvalid={!!errors.description} isRequired>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={6}
                color="white"
                bg="darkBlue2.900"
                borderColor="gray.600"
                placeholder="Please provide detailed information about your issue, feedback, or request. If you are reporting a bug please share the steps to reproduce the issue."
                _hover={{ borderColor: "gray.500" }}
                _focus={{ borderColor: "brandYellow.600" }}
                resize="vertical"
              />
              <FormLabel
                style={{
                  backgroundColor: THEME_COLORS.darkBlue2[900],
                  transform: "scale(0.85) translateY(-30px)",
                }}
              >
                Description
              </FormLabel>
              <HStack justify="space-between" mt={1}>
                {errors.description ? (
                  <Text color="red.400" fontSize="sm">
                    {errors.description}
                  </Text>
                ) : (
                  <Box />
                )}
                <Text color="gray.400" fontSize="sm">
                  {formData.description.length} characters
                </Text>
              </HStack>
            </FormControl>

            <FormControl variant="floating">
              <Select
                value={formData.preferredContactMethod}
                onChange={(e) =>
                  handleInputChange("preferredContactMethod", e.target.value)
                }
                color="white"
                bg="darkBlue2.900"
                borderColor="gray.600"
                _hover={{ borderColor: "gray.500" }}
                _focus={{ borderColor: "brandYellow.600" }}
                sx={{
                  option: {
                    backgroundColor: "darkBlue2.900",
                    color: "white",
                  },
                }}
              >
                {CONTACT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </Select>
              <FormLabel style={{ backgroundColor: THEME_COLORS.darkBlue2[900] }}>
                Preferred Contact Method
              </FormLabel>
            </FormControl>
          </Grid>
        </GridItem>
      </Grid>

      <Grid mt={6} templateColumns="repeat(3, 1fr)">
        <GridItem textStyle="h5">Attachments (optional)</GridItem>
        <GridItem
          colSpan={2}
          backgroundColor="darkBlue2.900"
          p={"24px"}
          borderRadius="16px"
        >
          <Box
            {...getRootProps()}
            border="2px dashed"
            borderColor={isDragActive ? "brandYellow.500" : "gray.600"}
            borderRadius="md"
            p={8}
            textAlign="center"
            cursor="pointer"
            bg={isDragActive ? "whiteAlpha.50" : "transparent"}
            transition="all 0.2s"
            _hover={{ borderColor: "brandYellow.500", bg: "whiteAlpha.50" }}
          >
            <input {...getInputProps()} />
            <Icon as={FiUpload as IconType} w={8} h={8} color="gray.400" mb={2} />
            <Text color="white" mb={1}>
              Click to upload files or drag and drop
            </Text>
            <Text color="gray.400" fontSize="sm">
              Images, PDFs, documents up to 10MB
            </Text>
          </Box>

          {formData.attachments.length > 0 && (
            <VStack mt={4} spacing={2} align="stretch">
              {formData.attachments.map((file) => (
                <HStack
                  key={file.name}
                  p={3}
                  bg="darkBlue2.700"
                  borderRadius="md"
                  justify="space-between"
                >
                  <VStack align="start" spacing={1} flex={1}>
                    <Text color="white" fontSize="sm" fontWeight="medium">
                      {file.name}
                    </Text>
                    <Text color="gray.400" fontSize="xs">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                    {!!uploadProgress[file.name] && (
                      <Progress
                        value={uploadProgress[file.name]}
                        size="sm"
                        colorScheme="yellow"
                        w="100%"
                        borderRadius="md"
                      />
                    )}
                  </VStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => removeFile(file)}
                  >
                    <Icon as={FiX as IconType} />
                  </Button>
                </HStack>
              ))}
            </VStack>
          )}
        </GridItem>
      </Grid>

      <HStack mt={6} justify={"flex-end"}>
        <Button
          variant="outline"
          colorScheme="white"
          textColor="white"
          _hover={{ bg: "whiteAlpha.200" }}
          onClick={handleCancel}
          isDisabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            handleSubmit();
          }}
          colorScheme="brandYellow"
          textColor="brandBlue.800"
          isLoading={isSubmitting}
          loadingText="Sending..."
          _hover={{ bg: "brandYellow.600" }}
        >
          Send
        </Button>
      </HStack>
    </>
  );
};
