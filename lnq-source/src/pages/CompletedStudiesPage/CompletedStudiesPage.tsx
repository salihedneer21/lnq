import { Text } from "@chakra-ui/react";
import CompletedStudiesTable from "./components/CompletedStudiesTable/CompletedStudiesTable";
import StudyStatsView from "./components/StudyStatsView/StudyStatsView";

export const CompletedStudiesPage: React.FC = () => {
  return (
    <>
      <Text textStyle={"h5"} mb={10}>
        Completed Studies
      </Text>
      <StudyStatsView />
      <CompletedStudiesTable />
    </>
  );
};
