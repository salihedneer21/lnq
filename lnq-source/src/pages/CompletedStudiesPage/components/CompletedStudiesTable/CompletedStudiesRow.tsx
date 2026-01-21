import { Td, Text } from "@chakra-ui/react";
import { HeaderCell } from "./HeaderCell";
import { Study } from "../../../../types/Study";
import utc from "dayjs/plugin/utc";
import dayjs from "dayjs";
dayjs.extend(utc);
interface Props {
  study: Pick<Study, HeaderCell["key"]>;
}

const CompletedStudiesRow: React.FC<Props> = ({ study }) => {
  return (
    <>
      <Td>
        <Text textStyle="sm">{study.orderCode}</Text>
      </Td>
      <Td>
        <Text textStyle="sm">
          {study.orderDescription && study.orderDescription.length > 0
            ? study.orderDescription
            : "-"}
        </Text>
      </Td>
      <Td>
        <Text textStyle="sm">{study.facility}</Text>
      </Td>
      <Td>
        <Text textStyle="sm">{study.rvus.toFixed(2)}</Text>
      </Td>
      <Td>
        <Text textStyle="sm">${study.dollarAmount.toFixed(2)}</Text>
      </Td>
      <Td>
        <Text textStyle="sm">{dayjs(study.dateFinalized).format("MM/DD/YYYY h:mma")}</Text>
      </Td>
      <Td>
        <Text textStyle="sm">{study.paymentStatus}</Text>
      </Td>
      <Td>
        <Text textStyle="sm">
          {study.paymentStatusReason === "ON_SCHEDULE_PAYABLE_OVER_TARGET" ? "Yes" : "No"}
        </Text>
      </Td>
    </>
  );
};

export default CompletedStudiesRow;
