import * as yup from "yup";
import { timeZoneOptions } from "../../utils/timeZones";

export const createGroupSchema = yup.object({
  facilityName: yup.string().min(3).required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  description: yup.string().required(),
  timeZone: yup
    .string()
    .oneOf(timeZoneOptions.map((val) => val.value))
    .required(),
});

export const editGroupSchema = yup.object({
  id: yup.string().uuid().required(),
  facilityName: yup.string().min(3).required(),
  email: yup.string().email().required(),
  phone: yup.string().required(),
  description: yup.string().required(),
  timeZone: yup
    .string()
    .oneOf(timeZoneOptions.map((val) => val.value))
    .required(),
  rvuRateVisible: yup.boolean().required(),
});
