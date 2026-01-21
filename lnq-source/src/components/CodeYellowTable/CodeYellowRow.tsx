import { CodeYellowResponse } from "../../types/CodeYellowResponse";
import dayjs from "dayjs";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Td,
  Text,
  Box,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";

import { WorkListType } from "../../types/Worklist";
import { CodeYellowAvailable } from "./CodeYellowAvailable";
import ProvidersButtonLink from "./ProvidersButtonLink";

interface CodeYellowRowProps {
  codeYellow: CodeYellowResponse;
  userTimeZoneAbbreviation: string;
  onMenuItemClick: (action: "cancel" | "deactivate", codeYellowId: string) => void;
  onProvidersClick: (codeYellow: CodeYellowResponse) => void;
  onEditClick: (codeYellow: CodeYellowResponse) => void;
}

const CodeYellowRow: React.FC<CodeYellowRowProps> = ({
  codeYellow,
  userTimeZoneAbbreviation,
  onMenuItemClick,
  onProvidersClick,
  onEditClick,
}) => {
  const respondingProvidersCount = codeYellow.respondingProvidersCount;
  const isScheduled = dayjs(codeYellow.startTime).isAfter(dayjs());

  return (
    <>
      <Td>
        {codeYellow.isTargeted ? (
          <Box
            w="32px"
            h="32px"
            borderRadius="6"
            bg="green.300"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="black" fontSize="sm" fontWeight="bold">
              T
            </Text>
          </Box>
        ) : (
          <Box
            w="32px"
            h="32px"
            borderRadius="6"
            bg="lightgrey"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="black" fontSize="sm" fontWeight="bold">
              N
            </Text>
          </Box>
        )}
      </Td>
      <Td textStyle="body" fontSize="xs">
        {dayjs(codeYellow.startTime).format("MM/DD/YYYY, h:mma")}
        {` (${userTimeZoneAbbreviation})`}
      </Td>
      <Td textStyle="body" fontSize="xs">
        {codeYellow.endTime ? (
          <>
            {dayjs(codeYellow.endTime).format("MM/DD/YYYY, h:mma")}
            {` (${userTimeZoneAbbreviation})`}
          </>
        ) : (
          "-"
        )}
      </Td>
      <Td>
        {codeYellow.worklist.type === WorkListType.GROUP
          ? codeYellow?.group?.facilityName
          : `${codeYellow?.group?.facilityName} - ${codeYellow?.worklist.user?.lastName} ${codeYellow?.worklist.user?.firstName}`}
      </Td>
      <Td>{codeYellow.pendingStudyCount ?? "-"}</Td>
      <Td>
        <ProvidersButtonLink
          codeYellow={codeYellow}
          count={respondingProvidersCount}
          onClick={() => {
            onProvidersClick(codeYellow);
          }}
        />
      </Td>
      <Td pl="6">
        <Text textStyle={"smBold"}>{codeYellow.usdPerRvu.toFixed(2)}</Text>
      </Td>
      <Td>
        <Text textStyle={"smBold"}>{(codeYellow.lnqPayableRVUs ?? 0).toFixed(2)}</Text>
      </Td>
      <Td>
        <Text textStyle={"smBold"}>
          {codeYellow.rvusLimit ? codeYellow.rvusLimit.toFixed(2) : "-"}
        </Text>
      </Td>
      <Td>
        <Text textStyle={"smBold"}>
          {codeYellow.amountLimit ? codeYellow.amountLimit.toFixed(2) : "-"}
        </Text>
      </Td>
      <Td pl="6">
        <CodeYellowAvailable
          codeYellowId={codeYellow.id}
          userResponded={codeYellow.userResponded}
        />
      </Td>
      <Td>
        {codeYellow.canManage && (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<BsThreeDotsVertical />}
              variant="ghost"
            />
            <MenuList bg="darkBlue2.900">
              {isScheduled && (
                <MenuItem
                  textStyle="smMdSemi"
                  bg="darkBlue2.900"
                  _hover={{ textStyle: "smBold" }}
                  onClick={() => onEditClick(codeYellow)}
                >
                  Edit
                </MenuItem>
              )}
              <MenuItem
                textStyle="smMdSemi"
                bg="darkBlue2.900"
                _hover={{ textStyle: "smBold" }}
                onClick={() =>
                  onMenuItemClick(isScheduled ? "cancel" : "deactivate", codeYellow.id)
                }
              >
                {isScheduled ? "Cancel" : "Deactivate"}
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Td>
    </>
  );
};

export default CodeYellowRow;
