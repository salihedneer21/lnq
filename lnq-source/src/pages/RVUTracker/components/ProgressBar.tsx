import { Box, Text } from "@chakra-ui/react";
import { COLORS, ProgressBarSection as ProgressBarSectionType, Shift } from "./types";

const MIN_SECTION_PERCENTAGE_THRESHOLD = 2;
const MIN_SECTION_WIDTH_PX = 30;

type Section = ProgressBarSectionType & {
  isFirst?: boolean;
  isLast?: boolean;
  minW?: string;
  label: string;
};

function computeSections(shift: Shift, largestTotalValue: number): Section[] {
  const lnqRVUs = Math.ceil(shift.lnqRVUs ?? 0);
  const totalRVUs = Math.ceil(shift.totalRVUs ?? 0);
  const totalStudies = Math.ceil(shift.totalStudies ?? 0);

  const totalValue = lnqRVUs + totalRVUs + totalStudies;

  const MIN_TOTAL_PERCENTAGE = 20;

  const totalPercentage =
    (largestTotalValue > 0
      ? Math.max((totalValue / largestTotalValue) * 100, MIN_TOTAL_PERCENTAGE)
      : MIN_TOTAL_PERCENTAGE) / 100;

  const maxWidth = 100 * totalPercentage;

  const sections: Section[] = [];

  // Scale all values relative to the maximum value, but cap at maxWidth
  if (lnqRVUs > 0) {
    const lnqPercentage = totalValue > 0 ? (lnqRVUs / totalValue) * maxWidth : 0;
    sections.push({
      value: lnqRVUs,
      color: COLORS.lnqRVUs,
      label: lnqRVUs > 0 ? `${Math.ceil(lnqRVUs)}` : "0",
      percentage: Math.min(lnqPercentage, maxWidth),
    });
  }

  if (totalRVUs > 0) {
    const rvuPercentage = totalValue > 0 ? (totalRVUs / totalValue) * maxWidth : 0;
    sections.push({
      value: totalRVUs,
      color: COLORS.rvus,
      label: `${Math.ceil(totalRVUs)}`,
      percentage: Math.min(rvuPercentage, maxWidth),
    });
  }

  if (totalStudies > 0) {
    const studiesPercentage = totalValue > 0 ? (totalStudies / totalValue) * maxWidth : 0;
    sections.push({
      value: totalStudies,
      color: COLORS.studies,
      label: `${Math.ceil(totalStudies)}`,
      percentage: Math.min(studiesPercentage, maxWidth),
    });
  }

  const result = sections.map((s, i) => {
    const minW =
      s.percentage < MIN_SECTION_PERCENTAGE_THRESHOLD ? `${MIN_SECTION_WIDTH_PX}px` : "0px";

    return {
      ...s,
      isFirst: i === 0,
      isLast: i === sections.length - 1,
      minW,
    };
  });

  return result;
}

interface ProgressBarSectionProps extends ProgressBarSectionType {
  isFirst?: boolean;
  isLast?: boolean;
  minW?: string;
  label: string;
}

const ProgressBarSection = ({
  percentage,
  color,
  isFirst,
  isLast,
  minW,
  label,
}: ProgressBarSectionProps) => {
  const showLabel =
    percentage >= MIN_SECTION_PERCENTAGE_THRESHOLD || (minW !== "0px" && label !== "0");
  const showTooltip = !showLabel && percentage > 0;
  const lastOrRestZIndex = isLast ? 1 : 5;

  return (
    <Box
      h="100%"
      bg={color}
      minW={minW ?? "0"}
      width={isFirst ? `${percentage}%` : `calc(${percentage}% + 20px)`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      paddingX={2}
      position="relative"
      borderRadius="11px"
      marginLeft={isFirst ? "0" : "-20px"}
      zIndex={isFirst ? 10 : lastOrRestZIndex}
      title={showTooltip ? label : undefined}
    >
      {showLabel && (
        <Text
          color={COLORS.primaryBg}
          fontWeight="medium"
          fontSize="sm"
          px={2}
          whiteSpace="nowrap"
          lineHeight="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          {label}
        </Text>
      )}
    </Box>
  );
};

interface ProgressBarProps {
  shift: Shift;
  largestTotalValue: number;
}

export const ProgressBar = ({ shift, largestTotalValue }: ProgressBarProps) => {
  const sections = computeSections(shift, largestTotalValue);

  return (
    <Box display="flex" alignItems="center" h="22px" w="100%">
      {sections.map((section, index) => (
        <ProgressBarSection key={`${section.label}-${index}`} {...section} />
      ))}
    </Box>
  );
};
