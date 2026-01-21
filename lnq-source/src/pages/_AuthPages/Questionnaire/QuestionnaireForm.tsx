import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useSubmitQuestionnaire } from "../../../api/QuestionnaireApi";
import { QuestionnairePayload, QuestionResponse } from "../../../types/Questionnaire";
import { Logo } from "../../../components/Logo";

interface Question {
  id: string;
  text: string;
  note?: string;
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const questionsList: Question[] = [
  {
    id: "investigation",
    text: "Are you currently the subject of an investigation by any hospital, licensing authority, DEA or CDS authorizing entities, education or training program, Medicare or Medicaid program, or any other private, federal or state health program or a defendant in any civil action that is reasonably related to your qualifications, competence, functions, or duties as a medical professional for alleged fraud, an act of violence, child abuse or a sexual offense or sexual misconduct?​",
  },
  {
    id: "dataBank",
    text: "To your knowledge, has information pertaining to you ever been reported to the National Practitioner Data Bank or Healthcare Integrity and Protection Data Bank?​",
  },
  {
    id: "sanctions",
    text: "Have you ever received sanctions from or are you currently the subject of investigation by any regulatory agencies (e.g. CLIA, OSHA, etc)?​",
  },
  {
    id: "misconduct",
    text: "Have you ever been convicted of, pled guilty to, pled nolo contendere to, sanctioned, reprimanded, restricted, disciplined or resigned in exchange for no investigation or adverse action within the last ten years for sexual misconduct or other illegal misconduct?​",
  },
  {
    id: "militaryInvestigation",
    text: "Are you currently being investigated or have you ever been sanctioned, reprimanded or cautioned by a military hospital, facility, or agency or voluntarily terminated or resigned while under investigation or in exchange for no investigation by a hospital or healthcare facility of any military agency?​",
  },
  {
    id: "liabilityCoverage",
    text: "Has your professional liability coverage ever been cancelled, restricted, declined or not renewed by the carrier based on your individual liability history?​",
  },
  {
    id: "liabilityRisk",
    text: "Have you ever been assessed a surcharge, or rated in a high risk class for your specialty, by your professional liability insurance carrier, based on your individual liability history?",
  },
  {
    id: "liabilityActions",
    text: "Have you had any professional liability actions (pending, settled, arbitrated, mediated or litigated) within the past 10 years? If yes, please provide information for each case.​",
    note: "Note: A criminal record will not necessarily be a bar to acceptance. Decisions will be made by each credentialing organization based upon all the relevant circumstances, including the nature of the crime.​",
  },
  {
    id: "felony",
    text: "Have you ever been convicted, pled guilty to, or pled nolo contendere to any felony?​",
  },
  {
    id: "misdemeanor",
    text: "In the past ten years have you been convicted of, pled guilty to, or pled nolo contendere to any misdemeanor (excluding minor traffic violations) or been found liable or responsible for any civil offense that is reasonably related to your qualifications, competence, functions or duties as a medical professional, or for fraud, an act of violence, child abuse or a sexual offense or sexual misconduct?​",
  },
  {
    id: "courtMartial",
    text: "Have you ever been court martialed for actions related to your duties as a medical professional?",
  },
];

const QuestionnaireForm = () => {
  const toast = useToast();
  const submitQuestionnaire = useSubmitQuestionnaire();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<QuestionnairePayload>(() => ({
    name: "",
    email: "",
    investigation: { answer: false, details: "" },
    dataBank: { answer: false, details: "" },
    sanctions: { answer: false, details: "" },
    misconduct: { answer: false, details: "" },
    militaryInvestigation: { answer: false, details: "" },
    liabilityCoverage: { answer: false, details: "" },
    liabilityRisk: { answer: false, details: "" },
    liabilityActions: { answer: false, details: "" },
    felony: { answer: false, details: "" },
    misdemeanor: { answer: false, details: "" },
    courtMartial: { answer: false, details: "" },
  }));

  const handleInputChange = (field: "name" | "email", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAnswerChange = (questionId: keyof QuestionnairePayload, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: {
        answer: value,
        details: value === false ? "" : (prev[questionId] as QuestionResponse).details,
      } as QuestionResponse,
    }));
  };

  const handleDetailsChange = (questionId: keyof QuestionnairePayload, details: string) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] as QuestionResponse),
        details,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      await submitQuestionnaire.mutateAsync(formData);
      setIsSubmitted(true);
      toast({
        title: "Form Submitted",
        description: "Thank you for completing the questionnaire.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "There was an error submitting the form. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error(error);
    }
  };
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.email.trim() !== "" &&
    isValidEmail(formData.email);

  return (
    <Box
      minHeight="100vh"
      bg="#2E3192"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
    >
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <Logo />

          {isSubmitted ? (
            <Card w="488" borderRadius="xl" bg="white">
              <CardBody p={14}>
                <VStack spacing={4} align="center">
                  <Text
                    fontSize="24px"
                    fontWeight="700"
                    color="brandBlue.800"
                    textAlign="center"
                  >
                    Thank you for completing the questionnaire!
                  </Text>
                  <Text fontSize="16px" color="gray.600" textAlign="center">
                    A LnQ team member will review your responses and contact you soon.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <Card width="100%" maxWidth={488} marginTop={30}>
              <CardBody paddingLeft={"60px"} paddingRight={"60px"} borderRadius={"20px"}>
                <VStack spacing={6} align="stretch">
                  <VStack spacing={2} align="center" mb={4}>
                    <Text
                      fontSize="24px"
                      fontWeight="700"
                      fontFamily="inter"
                      color="brandBlue.800"
                      textAlign="center"
                      maxW="315px"
                    >
                      Thanks for your interest in LnQ!
                    </Text>
                    <Text
                      fontSize="16px"
                      color="gray.600"
                      textAlign="center"
                      fontFamily="inter"
                      maxW="315px"
                    >
                      Please answer all the questions below to the best of your knowledge.
                      This info will only be reviewed by the LnQ team.
                    </Text>
                  </VStack>

                  <Box bg="white" borderRadius="md">
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Name"
                      color="gray.600"
                      height={14}
                      borderColor="gray.300"
                    />
                  </Box>
                  <Box bg="white" borderRadius="md">
                    <Input
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Email"
                      type="email"
                      color="gray.600"
                      height={14}
                      borderColor={
                        formData.email && !isValidEmail(formData.email)
                          ? "red.500"
                          : "gray.300"
                      }
                      _hover={{
                        borderColor:
                          formData.email && !isValidEmail(formData.email)
                            ? "red.500"
                            : "gray.300",
                      }}
                    />
                    {formData.email && !isValidEmail(formData.email) && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        Please enter a valid email address
                      </Text>
                    )}
                  </Box>

                  {questionsList.map((question) => (
                    <Box key={question.id} bg="white" borderRadius="md">
                      <Text
                        color="gray.500"
                        fontSize="12px"
                        fontWeight="700"
                        mb={2}
                        width="360px"
                      >
                        {question.text}
                      </Text>
                      {question.note && (
                        <Text
                          color="gray.500"
                          fontSize="12px"
                          fontWeight="500"
                          mb={4}
                          width="360px"
                          placeholder=""
                        >
                          {question.note}
                        </Text>
                      )}
                      <RadioGroup
                        value={
                          (
                            formData[
                              question.id as keyof QuestionnairePayload
                            ] as QuestionResponse
                          ).answer
                            ? "Yes"
                            : "No"
                        }
                        onChange={(value) =>
                          handleAnswerChange(
                            question.id as keyof QuestionnairePayload,
                            value === "Yes",
                          )
                        }
                      >
                        <Stack direction="column" spacing={4}>
                          <Radio colorScheme="brandBlue" value="No">
                            <Text color="gray.600">No</Text>
                          </Radio>
                          <Radio colorScheme="brandBlue" value="Yes">
                            <Text color="gray.600">Yes</Text>
                          </Radio>
                        </Stack>
                      </RadioGroup>

                      {(
                        formData[
                          question.id as keyof QuestionnairePayload
                        ] as QuestionResponse
                      ).answer && (
                        <FormControl variant="floating" mt={3}>
                          <Textarea
                            placeholder=""
                            value={
                              (
                                formData[
                                  question.id as keyof QuestionnairePayload
                                ] as QuestionResponse
                              ).details
                            }
                            onChange={(e) =>
                              handleDetailsChange(
                                question.id as keyof QuestionnairePayload,
                                e.target.value,
                              )
                            }
                            minH="100px"
                            resize="vertical"
                            color="gray.600"
                            borderColor="gray.300"
                          />
                          <FormLabel style={{ color: "#A2ADBE", fontSize: "16px" }}>
                            Explain the reason
                          </FormLabel>
                        </FormControl>
                      )}
                    </Box>
                  ))}

                  <Text
                    color="gray.500"
                    fontSize="12px"
                    fontWeight="500"
                    mb={4}
                    ms={2}
                    width="360px"
                  >
                    After you have submitted, be on the lookout for someone from LnQ to
                    reach out to you to schedule a follow up conversation focused on how we
                    can best find work that matches your preferences.
                  </Text>

                  <Button
                    colorScheme={isFormValid ? "brandYellow" : "gray"}
                    size="lg"
                    width="100%"
                    onClick={() => void handleSubmit()}
                    isLoading={submitQuestionnaire.isPending}
                    isDisabled={!isFormValid}
                    _disabled={{
                      bg: "#F1EFEE",
                      color: "#2E3192",
                      fontsize: "16px",
                      opacity: 0.5,
                      cursor: "not-allowed",
                    }}
                  >
                    Submit
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};
export default QuestionnaireForm;
