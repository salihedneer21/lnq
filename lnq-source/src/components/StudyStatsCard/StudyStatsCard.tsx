import { Flex, Text } from "@chakra-ui/react";

interface Props {
  backgroundColor: string;
  title: string;
  subtitle: string;
  subtitleStyle?: string;
}

const StudyStatsCard: React.FC<Props> = ({
  backgroundColor,
  subtitle,
  title,
  subtitleStyle,
}) => {
  return (
    <Flex
      flexDir="column"
      justifyContent="space-between"
      backgroundColor={backgroundColor}
      p={6}
      borderRadius="lg"
      w="fit-content"
      minW="full"
    >
      <Text textStyle="caption" mb="18px" textColor="#515157">
        {title}
      </Text>
      <Text textStyle={subtitleStyle ?? "h3"} textColor="#02031A" whiteSpace="nowrap">
        {subtitle}
      </Text>
    </Flex>
  );
};

export default StudyStatsCard;
