import { Tab } from "@chakra-ui/react";

export interface StyledTabProps {
  value: string;
  label?: string;
  icon?: JSX.Element;
}
export const StyledTab = (props: StyledTabProps): JSX.Element => {
  return (
    <Tab textStyle="h5" _selected={{ color: "brandYellow.600" }} color="gray.500">
      {props.label}
    </Tab>
  );
};
