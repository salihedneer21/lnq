import { useMutation } from "@tanstack/react-query";

import {
  SupportTicketCategory,
  SupportTicketContactMethod,
  SupportTicketPriority,
} from "../types/Support";
import useApi from "./hooks/useApi";

export interface ContactFormSubmission {
  name: string;
  email: string;
  facilityGroup: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  subject: string;
  description: string;
  preferredContactMethod: SupportTicketContactMethod;
  attachments?: File[];
}

export interface ContactSubmissionResponse {
  message: string;
  ticketId?: string;
}

export const useSubmitContactForm = () => {
  const { requestFn } = useApi<ContactSubmissionResponse, FormData>({
    url: "/support/ticket",
    method: "POST",
  });

  return useMutation({
    mutationFn: (data: FormData) => requestFn(data),
  });
};
