import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  FormControl,
  FormLabel,
  Grid,
  Textarea,
  Box,
  SimpleGrid,
  Link,
  Stack,
} from "@chakra-ui/react";
import { ProviderProfile } from "../../../types/CurrentUser";
import { FloatingInput } from "../../../components/ProviderProfileForm/FloatingInput";
import { TagSelect } from "../../../components/ProviderProfileForm/TagSelect";
import { CustomSwitch } from "../../../components/ProviderProfileForm/CustomSwitch";
import {
  SUB_SPECIALTIES,
  WORK_DAYS,
  WORK_HOURS,
  RVU_RANGES,
  US_STATES,
  WORK_TYPE_OPTIONS,
} from "../../../constants/providerFormOptions";

interface ProviderProfileFormProps {
  provider?: ProviderProfile;
}

export interface ProviderProfileFormRef {
  getFormData: () => Partial<ProviderProfile>;
  resetForm: () => void;
}

interface WorkType {
  weekdays: boolean;
  weekends: boolean;
  swing: boolean;
  overnights: boolean;
  dedicated: boolean;
}

const ProviderProfileForm = forwardRef<ProviderProfileFormRef, ProviderProfileFormProps>(
  ({ provider }, ref) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [providerId, setProviderId] = useState("");
    const [phone, setPhone] = useState("");
    const [subSpecialties, setSubSpecialties] = useState<string[]>([]);
    const [providerNotes, setProviderNotes] = useState("");
    const [workDays, setWorkDays] = useState<string[]>([]);
    const [workHours, setWorkHours] = useState<string[]>([]);
    const [workType, setWorkType] = useState<WorkType>({
      weekdays: true,
      weekends: false,
      swing: false,
      overnights: false,
      dedicated: false,
    });
    const [rvus, setRvus] = useState<string[]>([]);
    const [stateLicenses, setStateLicenses] = useState<string[]>([]);
    const [credentialPacket, setCredentialPacket] = useState("");
    const [malpractice, setMalpractice] = useState(false);

    // Utility functions for array operations
    const addToArray = <T,>(array: T[], item: T): T[] => {
      return array.includes(item) ? array : [...array, item];
    };

    const removeFromArray = <T,>(array: T[], item: T): T[] => {
      return array.filter((i) => i !== item);
    };

    const resetForm = () => {
      setFirstName(provider?.firstName ?? "");
      setLastName(provider?.lastName ?? "");
      setEmail(provider?.email ?? "");
      setProviderId(provider?.providerId ?? "");
      setAddress(provider?.address ?? "");
      setPhone(provider?.phone ?? "");
      setSubSpecialties(provider?.subSpecialties ?? []);
      setProviderNotes(provider?.providerNotes ?? "");
      setWorkDays(provider?.workDays ?? []);
      setWorkHours(provider?.workHours ?? []);
      setWorkType(
        provider?.workType ?? {
          weekdays: true,
          weekends: false,
          swing: false,
          overnights: false,
          dedicated: false,
        },
      );
      setRvus(provider?.rvus ?? []);
      setStateLicenses(provider?.stateLicenses ?? []);
      setCredentialPacket(provider?.credentialPacket ?? "");
      setMalpractice(provider?.malpractice ?? false);
    };

    useEffect(() => {
      resetForm();
    }, [provider]);

    useImperativeHandle(ref, () => ({
      getFormData: () => ({
        firstName,
        lastName,
        email,
        address,
        phone,
        subSpecialties,
        providerNotes,
        workDays,
        workHours,
        workType,
        rvus,
        stateLicenses,
        credentialPacket,
        malpractice,
      }),
      resetForm,
    }));

    const handleWorkTypeChange = (key: keyof WorkType, value: boolean) => {
      setWorkType({ ...workType, [key]: value });
    };

    return (
      <Box maxW="100%" mx="auto">
        <Grid gap={6} backgroundColor="darkBlue2.900" p="24px" borderRadius="16px">
          <FloatingInput label="First Name" value={firstName} onChange={setFirstName} />
          <FloatingInput label="Last name" value={lastName} onChange={setLastName} />
          <FloatingInput
            label="Phone number"
            value={phone}
            onChange={setPhone}
            type="tel"
          />
          <FloatingInput label="Email" value={email} onChange={setEmail} type="email" />
          <FloatingInput
            label="Address"
            value={address}
            onChange={setAddress}
            type="text"
          />
          <FloatingInput
            label="NPI Number"
            value={providerId}
            onChange={setProviderId}
            type="number"
            disabled={true}
          />
          <TagSelect
            label="Sub Specialty Interests"
            placeholder="Select the subspecialties"
            options={SUB_SPECIALTIES}
            selectedValues={subSpecialties}
            onAdd={(value) => setSubSpecialties(addToArray(subSpecialties, value))}
            onRemove={(value) => setSubSpecialties(removeFromArray(subSpecialties, value))}
          />
          <FormControl>
            <FormLabel color="gray.400">Provider notes</FormLabel>
            <Textarea
              color="white"
              bg="darkBlue2.800"
              borderRadius="8px"
              value={providerNotes}
              onChange={(e) => setProviderNotes(e.target.value)}
              placeholder="Enter provider notes"
            />
          </FormControl>
          <FormControl>
            <FormLabel color="gray.400">Work availability</FormLabel>
            <SimpleGrid columns={2} spacing={2}>
              <Box>
                <TagSelect
                  label="Days"
                  placeholder="Days"
                  options={WORK_DAYS}
                  selectedValues={workDays}
                  onAdd={(value) => setWorkDays(addToArray(workDays, value))}
                  onRemove={(value) => setWorkDays(removeFromArray(workDays, value))}
                />
              </Box>
              <Box>
                <TagSelect
                  label="Hours"
                  placeholder="Hours"
                  options={WORK_HOURS}
                  selectedValues={workHours}
                  onAdd={(value) => setWorkHours(addToArray(workHours, value))}
                  onRemove={(value) => setWorkHours(removeFromArray(workHours, value))}
                />
              </Box>
            </SimpleGrid>
          </FormControl>
          <FormControl>
            <FormLabel color="gray.400">What type of work are you interested in?</FormLabel>
            <Stack gap={6} spacing={4}>
              {WORK_TYPE_OPTIONS.map(({ key, label }) => (
                <CustomSwitch
                  key={key}
                  label={label}
                  isChecked={workType[key as keyof WorkType]}
                  onChange={(value) => handleWorkTypeChange(key as keyof WorkType, value)}
                />
              ))}
            </Stack>
          </FormControl>
          <TagSelect
            label="RVUs Per Month Interested In"
            placeholder="Select an amount"
            options={RVU_RANGES}
            selectedValues={rvus}
            onAdd={(value) => setRvus(addToArray(rvus, value))}
            onRemove={(value) => setRvus(removeFromArray(rvus, value))}
          />
          <TagSelect
            label="State Medical Licensure"
            placeholder="Select the state"
            options={US_STATES}
            selectedValues={stateLicenses}
            onAdd={(value) => setStateLicenses(addToArray(stateLicenses, value))}
            onRemove={(value) => setStateLicenses(removeFromArray(stateLicenses, value))}
          />
          <FloatingInput
            label="Harbera Credential Packet"
            value={credentialPacket}
            onChange={setCredentialPacket}
            disabled={true}
          />
          {credentialPacket && (
            <Link href={credentialPacket} color="brandYellow.600" isExternal mt={2}>
              {credentialPacket}
            </Link>
          )}
          <FormControl display="flex" justifyContent="space-between" gap={2}>
            <FormLabel color="gray.400">Malpractice Insurance</FormLabel>
            <CustomSwitch label="" isChecked={malpractice} onChange={setMalpractice} />
          </FormControl>
        </Grid>
      </Box>
    );
  },
);

ProviderProfileForm.displayName = "ProviderProfileForm";

export default ProviderProfileForm;
