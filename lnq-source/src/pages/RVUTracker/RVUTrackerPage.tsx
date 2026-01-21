import { useCallback, useState } from "react";
import DateRangePicker from "../../components/DateRangePicker/DateRangePicker";
import { HStack, Text, VStack, Button } from "@chakra-ui/react";
import GroupSelector from "./components/GroupSelector";
import PerformanceView from "./components/PerfomanceProvider/PerformanceView";
import ProviderMetrics from "./components/ProviderMetrics/ProviderMetrics";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

enum TabType {
  PERFORMANCE = "performance",
  PROVIDER_METRICS = "provider_metrics",
}

dayjs.extend(utc);
dayjs.extend(timezone);

const RVUTrackerPage: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<Date>(dayjs().startOf("day").toDate());
  const [groupFilter, setGroupFilter] = useState<string | undefined>();
  const [groupTimezone, setGroupTimezone] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<TabType>(TabType.PERFORMANCE);

  const onDatesChange = useCallback(
    (dates: Date[]) => {
      if (dates.length === 1) {
        // Convert the selected date to the group's timezone if available
        const date = groupTimezone
          ? dayjs(dates[0]).tz(groupTimezone, true).toDate()
          : dayjs(dates[0]).toDate();
        setDateFilter(date);
      }
    },
    [groupTimezone],
  );

  const onGroupChange = useCallback((groupId: string, timezone: string | undefined) => {
    setGroupFilter(groupId);
    setGroupTimezone(timezone);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case TabType.PERFORMANCE:
        return <PerformanceView date={dateFilter} groupId={groupFilter} />;
      case TabType.PROVIDER_METRICS:
        return <ProviderMetrics date={dateFilter} groupId={groupFilter} />;
      default:
        return <PerformanceView date={dateFilter} groupId={groupFilter} />;
    }
  };

  return (
    <VStack align="stretch" spacing={6}>
      <VStack align="flex-start" spacing={4}>
        <Text textStyle="h5">RVU Tracker</Text>
        <HStack spacing={2}>
          <Button
            variant="outline"
            size="sm"
            borderColor={activeTab === TabType.PERFORMANCE ? "yellow.400" : "white"}
            color={activeTab === TabType.PERFORMANCE ? "yellow.400" : "white"}
            bg="transparent"
            _hover={{ opacity: 0.7 }}
            onClick={() => setActiveTab(TabType.PERFORMANCE)}
          >
            Performance View
          </Button>
          <Button
            variant="outline"
            size="sm"
            borderColor={activeTab === TabType.PROVIDER_METRICS ? "yellow.400" : "white"}
            color={activeTab === TabType.PROVIDER_METRICS ? "yellow.400" : "white"}
            bg="transparent"
            _hover={{ opacity: 0.7 }}
            onClick={() => setActiveTab(TabType.PROVIDER_METRICS)}
          >
            Provider Metrics
          </Button>
        </HStack>
      </VStack>

      <HStack justify="flex-end" align="flex-start">
        <HStack>
          <GroupSelector onGroupSelected={onGroupChange} />
          <DateRangePicker
            initialDates={[dateFilter]}
            variant="single"
            disableClear
            buttonStyle={{
              minW: "fit-content",
              minH: "34px",
            }}
            onDatesChange={onDatesChange}
          />
        </HStack>
      </HStack>

      {renderContent()}
    </VStack>
  );
};

export default RVUTrackerPage;
