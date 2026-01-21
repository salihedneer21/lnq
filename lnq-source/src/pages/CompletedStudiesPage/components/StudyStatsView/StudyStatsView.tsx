import { SimpleGrid } from "@chakra-ui/react";
import StudyStatsCard from "../../../../components/StudyStatsCard/StudyStatsCard";
import { useGetMyStudyStats } from "../../../../api/StudyApi";

const StudyStatsView: React.FC = () => {
  const { data: myStudyStatsData } = useGetMyStudyStats();
  return (
    <SimpleGrid columns={{ base: 1, lg: 6 }} spacing="24px" mb="72px">
      <StudyStatsCard
        backgroundColor="#FF9760"
        title="Total lifetime completed studies"
        subtitle={`${myStudyStatsData?.totalLifetimeStudies ?? 0}`}
      />
      <StudyStatsCard
        backgroundColor="#32E484"
        title="Total lifetime RVU's completed"
        subtitle={`${myStudyStatsData?.totalLifetimeRVUs?.toFixed(2) ?? 0}`}
      />
      <StudyStatsCard
        backgroundColor="#91B6FE"
        title="Studies pending payment"
        subtitle={`${myStudyStatsData?.studiesPendingPayment ?? 0}`}
      />
      <StudyStatsCard
        backgroundColor="#F7E376"
        title="RVU's pending payment"
        subtitle={`${myStudyStatsData?.rvusPendingPayment?.toFixed(2) ?? 0}`}
      />
      <StudyStatsCard
        backgroundColor="#FEC0A8"
        title="Total Unmapped CPT Studies"
        subtitle={`${myStudyStatsData?.unmappedStudies ?? 0}`}
      />
      <StudyStatsCard
        backgroundColor="brandYellow.600"
        title="Pending payment amount"
        subtitle={`$${myStudyStatsData?.payoutPaymentAmount?.toFixed(2) ?? 0}`}
      />
    </SimpleGrid>
  );
};

export default StudyStatsView;
