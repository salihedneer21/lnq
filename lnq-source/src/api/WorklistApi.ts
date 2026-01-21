import { useQuery } from "@tanstack/react-query";
import { WorkList } from "../types/Worklist";
import useApi from "./hooks/useApi";

export interface GetWorklistProps {
  worklistId: string;
}
export const useGetWorklist = ({ worklistId }: GetWorklistProps) => {
  const { requestFn } = useApi<{
    message: string;
    worklist: WorkList;
  }>({
    url: "/worklist/" + worklistId,
    method: "GET",
  });

  return useQuery({
    queryKey: ["worklist", worklistId],
    queryFn: () => requestFn(),
  });
};

export const useGetUserWorklists = () => {
  const { requestFn } = useApi<{
    message: string;
    worklists: WorkList[];
  }>({
    url: "/myWorklist",
    method: "GET",
  });

  return useQuery({
    queryKey: ["myWorklists"],
    queryFn: () => requestFn(),
    select: (data) => data.worklists[0],
    staleTime: Infinity,
  });
};
