import { useCallback, useState } from "react";
import {
  Text,
  Button,
  Card,
  CardBody,
  Center,
  Stack,
  VStack,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Select,
  Switch,
  HStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { Logo } from "../../components/Logo";
import { useSendTestORMMessage } from "../../api/ORMTestAPI";
import PageContainer from "../../components/PageContainer";
import { THEME_COLORS } from "../../base/theme/foundations/colors";
import { timeZoneOptions } from "../../utils/timeZones";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const OrmTestPage: React.FC = () => {
  const { mutateAsync: sendORMMessage, isPending: isSendingORMMessage } =
    useSendTestORMMessage();
  // const { mutateAsync: addHealthSystemToMasterCPTCodes } =
  //   useAddHealthSystemToMasterCPTCodes();
  // const { mutateAsync: addMasterCPTCodes } = useAddMasterCPTCodes();
  const [facility, setFacility] = useState("");
  const [radiologistID, setRadiologistID] = useState("");
  const [orderId, setOrderId] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [orderControl, setOrderControl] = useState<string>();
  const [selectedDateTime, setSelectedDateTime] = useState<string>(
    dayjs().format("MM-DD-YYYY HH:mm:ss"),
  );
  const [selectedTimezone, setSelectedTimezone] = useState(timeZoneOptions[0].value);
  const [usePlainText, setUsePlainText] = useState(false);
  const toast = useToast();

  const submit = useCallback(async () => {
    try {
      const { message } = await sendORMMessage({
        facility,
        orderCode,
        radiologistID,
        orderId,
        orderControl,
        formattedDate: usePlainText
          ? selectedDateTime
          : dayjs(selectedDateTime)
              .tz(selectedTimezone, true)
              .utc()
              .format("MM-DD-YYYY HH:mm:ss"),
      });
      toast({ description: message, status: "success" });
    } catch (e: unknown) {
      console.log(e);
    } finally {
      // setFacility("");
      // setRadiologistID("");
      setOrderId("");
      setOrderControl(undefined);
      // setSelectedDateTime("");
    }
  }, [
    sendORMMessage,
    facility,
    orderCode,
    radiologistID,
    orderId,
    orderControl,
    selectedDateTime,
    selectedTimezone,
    usePlainText,
    toast,
  ]);

  // const onUploadMasterCSV = useCallback(
  //   (file: File) => {
  //     parseMappingCSVFile(
  //       file,
  //       masterCPTSchema,
  //       transformMasterCSVHeaders,
  //       transformMasterCSVData,
  //       async (data, error) => {
  //         if (error) {
  //           toast({ description: error.message, status: "error" });
  //           return;
  //         }
  //         if (data && data.length > 0) {
  //           const { message } = await addMasterCPTCodes(data);
  //           toast({ description: message, status: "success" });
  //         }
  //       },
  //     );
  //   },
  //   [addMasterCPTCodes, toast],
  // );

  // const onUploadHealthSystemToCPTCSV = useCallback(
  //   (file: File) => {
  //     parseMappingCSVFile(
  //       file,
  //       healthSystemToCPTMasterSchema,
  //       transformHealthSystemToMasterCPTHeaders,
  //       transformHealthSystemToMasterCPTData,
  //       async (data, error) => {
  //         if (error) {
  //           toast({ description: error.message, status: "error" });
  //           return;
  //         }
  //         if (data && data.length > 0) {
  //           const { message } = await addHealthSystemToMasterCPTCodes(data);
  //           toast({ description: message, status: "success" });
  //         }
  //       },
  //     );
  //   },
  //   [addHealthSystemToMasterCPTCodes, toast],
  // );

  return (
    <PageContainer variant="centered-auth">
      <VStack minH="100%">
        <Logo />
        <Card width={488} marginTop={30}>
          <CardBody paddingLeft={"60px"} paddingRight={"60px"} borderRadius={"20px"}>
            <Text fontSize="md" align="center" mt={2} color="gray">
              Fill out form to send ORM test message
            </Text>
            <form>
              <Stack spacing={4} mt={8}>
                <VStack justify={"center"} spacing={5}>
                  <FormControl variant="floating">
                    <Input
                      placeholder=""
                      aria-label="Order ID"
                      name="order_id"
                      required
                      onChange={(e) => setOrderId(e.target.value)}
                      onDoubleClick={() => {
                        setOrderId(`${new Date().valueOf()}`);
                        setOrderControl("RE");
                      }}
                      value={orderId}
                    />
                    <FormLabel>Order ID</FormLabel>
                  </FormControl>
                  <FormControl variant="floating">
                    <Input
                      placeholder=""
                      aria-label="Order Code"
                      name="order_code"
                      required
                      onChange={(e) => setOrderCode(e.target.value)}
                      value={orderCode}
                    />
                    <FormLabel>Order Code</FormLabel>
                  </FormControl>
                  <FormControl variant="floating">
                    <Select
                      color="primary"
                      placeholder="Select option"
                      minH="56px"
                      value={orderControl ?? ""}
                      onChange={(e) => setOrderControl(e.target.value)}
                    >
                      <option value="NW">NW - New Order</option>
                      <option value="SC">SC - Status Change</option>
                      <option value="XO">XO - Order Update</option>
                      <option value="CA">CA - Cancel Order</option>
                      <option value="RE">RE - Result</option>
                    </Select>
                    <FormLabel>Order Control</FormLabel>
                  </FormControl>
                  <FormControl variant="floating">
                    <Input
                      placeholder=""
                      aria-label="Facility"
                      name="facility"
                      required
                      onChange={(e) => setFacility(e.target.value)}
                      value={facility}
                    />
                    <FormLabel>Facility</FormLabel>
                  </FormControl>
                  <FormControl variant="floating">
                    <Input
                      placeholder=""
                      aria-label="Radiologist-ID"
                      name="radiologist-id"
                      required
                      type="number"
                      onChange={(e) => setRadiologistID(e.target.value)}
                      value={radiologistID}
                    />
                    <FormLabel>NPI Number</FormLabel>
                  </FormControl>
                  <FormControl>
                    <HStack justify="space-between" mb={2}>
                      <FormLabel mb={0}>Date and Time</FormLabel>
                      <HStack>
                        <Text fontSize="sm" color="gray.500">
                          Use plain text
                        </Text>
                        <Switch
                          colorScheme="yellow"
                          isChecked={usePlainText}
                          onChange={(e) => {
                            setUsePlainText(e.target.checked);
                            setSelectedDateTime("");
                          }}
                        />
                      </HStack>
                    </HStack>
                    {usePlainText ? (
                      <Input
                        placeholder="YYYY-MM-DDTHH:mm:ss (or other format i.e COBC format 20250312182841-0500)"
                        value={selectedDateTime}
                        onChange={(e) => setSelectedDateTime(e.target.value)}
                      />
                    ) : (
                      <>
                        <Input
                          type="datetime-local"
                          value={selectedDateTime}
                          onChange={(e) => setSelectedDateTime(e.target.value)}
                        />
                        <FormControl mt={2}>
                          <FormLabel>Timezone</FormLabel>
                          <Select
                            value={selectedTimezone}
                            onChange={(e) => setSelectedTimezone(e.target.value)}
                          >
                            {timeZoneOptions.map((tz) => (
                              <option key={tz.value} value={tz.value}>
                                {tz.label}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </>
                    )}
                  </FormControl>
                </VStack>
                <Button
                  my={4}
                  backgroundColor={THEME_COLORS.brandYellow[500]}
                  textColor={THEME_COLORS.brandBlue[800]}
                  onClick={() => void submit()}
                  isDisabled={!(facility && radiologistID) || isSendingORMMessage}
                  isLoading={isSendingORMMessage}
                >
                  Send ORM Message
                </Button>
                <Center>
                  <ChakraLink
                    as={Link}
                    to={".."}
                    color="gray.600"
                    fontWeight="medium"
                    fontSize="sm"
                    _hover={{ color: "gray.900" }}
                  >
                    Back
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
