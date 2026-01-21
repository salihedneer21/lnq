import { HStack, TabIndicator, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { StyledTab, StyledTabProps } from "./StyledTab";

interface Props {
  tabList: StyledTabProps[];
  tabPanels: JSX.Element[];
  actionItems?: JSX.Element[];
  size?: string;
  selectedTab?: string;
  onChange?: (value: string) => void;
}

export const StyledTabBar = ({
  tabList,
  tabPanels,
  actionItems = [],
  size,
  selectedTab,
  onChange,
}: Props) => {
  const handleTabChange = (index: number) => {
    if (onChange) {
      const selectedValue = tabList[index].value;
      onChange(selectedValue);
    }
  };

  const selectedIndex = selectedTab
    ? tabList.findIndex((tab) => tab.value === selectedTab)
    : undefined;

  return (
    <Tabs variant="unstyled" size={size} index={selectedIndex} onChange={handleTabChange}>
      <HStack justify={"space-between"}>
        <TabList>
          {tabList.map((i: StyledTabProps) => (
            <StyledTab key={i?.value} value={i?.value} label={i?.label} />
          ))}
        </TabList>
        {actionItems.map((i: JSX.Element) => i)}
      </HStack>
      <TabIndicator height="2px" bg="brandYellow.600" borderRadius="4px" />
      <TabPanels>
        {tabPanels.map((i: JSX.Element) => (
          <TabPanel key={i?.key} padding={0}>
            {i}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};
