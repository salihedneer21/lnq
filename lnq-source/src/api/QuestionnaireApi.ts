import { useMutation } from "@tanstack/react-query";
import useApi from "./hooks/useApi";
import { AxiosError } from "axios";
import { QuestionnairePayload, QuestionnaireResponse } from "../types/Questionnaire";

export interface ApiError {
  message: string;
  status: number;
}

export const useSubmitQuestionnaire = () => {
  const { requestFn } = useApi<QuestionnaireResponse>({
    url: "/questionnaire",
    method: "POST",
  });

  return useMutation<QuestionnaireResponse, AxiosError<ApiError>, QuestionnairePayload>({
    mutationFn: (data: QuestionnairePayload) => requestFn(data),
  });
};
