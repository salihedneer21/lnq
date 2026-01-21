import { VStack, Text, Grid } from "@chakra-ui/react";
import { Resource } from "../../../types/Resource";
import { StyledTable } from "../../../components/StyledTable/StyledTable";

const ResourceGroup: React.FC<Resource> = ({ groupName, resources }) => {
  return (
    <VStack my="12px" alignItems="flex-start">
      {groupName === "Wellness Services" && (
        <Grid templateColumns="repeat(2, 1fr)" gap={4} alignSelf="center" mb={4}>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/YIdwv7eTr1c?si=LXkjylf4JHYEaWz1"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/Imek2gTmn5M?si=PCPp9u0WD7TFSOKP"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/SUSYNiWAEpE?si=vmkxfK8TXHUx-UYz"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </Grid>
      )}
      <Text textStyle="h5">{groupName}</Text>
      <StyledTable
        columns={[
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
        ]}
        data={resources}
      />
    </VStack>
  );
};

export default ResourceGroup;
