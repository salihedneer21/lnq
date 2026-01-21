import useApi from "./hooks/useApi";
import { ORMMessage } from "../types/ORMMessage";
import { useMutation } from "@tanstack/react-query";
import { EnvConfig } from "../base/EnvConfig";
import dayjs from "dayjs";

const generateRandomDate = (baseDate: Date, maxDaysDiff = 2): string => {
  const randomDays = Math.random() * maxDaysDiff;
  const randomHours = Math.random() * 24;
  const randomMinutes = Math.random() * 60;
  const newDate = new Date(baseDate);
  newDate.setDate(newDate.getDate() + randomDays);
  newDate.setHours(newDate.getHours() + randomHours);
  newDate.setMinutes(newDate.getMinutes() + randomMinutes);
  return dayjs(newDate).format("YYYY-MM-DDTHH:mm:ss");
};

export const useSendTestORMMessage = () => {
  const { requestFn } = useApi<{ message: string }>({
    url: "/orm",
    method: "POST",
    headers: {
      Authorization: `Bearer ${EnvConfig.VITE_API_KEY}`,
    },
  });

  return useMutation({
    mutationFn: async (data: {
      orderId: string;
      orderCode: string;
      orderControl?: string;
      facility: string;
      radiologistID: string;
      formattedDate?: string;
    }) => {
      const { facility, radiologistID, orderId, orderControl, orderCode, formattedDate } =
        data;
      const baseDate = new Date();
      const currentFormattedDate = formattedDate ?? dayjs().format("YYYY-MM-DDTHH:mm:ss");

      const signedReportTime = new Date(currentFormattedDate).getTime();
      const studyAvailableTime = new Date(generateRandomDate(baseDate)).getTime();

      const ormMessage: ORMMessage = {
        order_id: orderId,
        facility,
        radiologist_id: radiologistID,
        order_control: orderControl,
        order_code: orderCode,
        order_type: "",
        end_time: Date.now(),
        start_time: Date.now(),
        callback_phone_number: "",
        entered_by_firstname: "",
        entered_by_id: "",
        entered_by_lastname: "",
        image_available_flag: false,
        order_code_modifier: "",
        order_comments: "",
        order_description: "",
        radiologist_name: "",
        datetime_status_change: currentFormattedDate,
        accession_number: "accession_number",
        encounter_class: "encounter_class",
        signed_report_datetime: signedReportTime,
        study_available_datetime: studyAvailableTime,
        msg_received_datetime: new Date(generateRandomDate(baseDate)).getTime(),
        msh_datetime: new Date(generateRandomDate(baseDate)).getTime(),
        study_tat_minutes: Math.floor(
          (signedReportTime - studyAvailableTime) / (1000 * 60),
        ).toString(),
      };
      return requestFn(ormMessage);
    },
  });
};
