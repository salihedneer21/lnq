import { useState, useEffect } from "react";
import { Button, Checkbox, Grid, GridItem, HStack, Text, useToast } from "@chakra-ui/react";

import { useUpdateUser, useUserData } from "../../../api/UserApi";

const NotificationsTab = () => {
  const { data: currentUser } = useUserData();
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState<boolean>(false);
  const { mutate: updateUser, isPending } = useUpdateUser();
  const toast = useToast();

  useEffect(() => {
    setSmsNotificationsEnabled(Boolean(currentUser?.smsNotifications));
  }, [currentUser?.smsNotifications]);

  const onButtonPress = () => {
    if (!currentUser) return;
    updateUser(
      { ...currentUser, smsNotifications: smsNotificationsEnabled },
      {
        onSuccess: () =>
          toast({
            title: "Settings saved",
            description: `SMS notifications ${
              smsNotificationsEnabled ? "enabled" : "disabled"
            }.`,
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top",
          }),
      },
    );
  };

  return (
    <>
      <Grid mt={20} templateColumns="repeat(3, 1fr)">
        <GridItem textStyle={"h5"}>Type of notifications</GridItem>
        <GridItem colSpan={2} backgroundColor="darkBlue2.900" p="24px" borderRadius="16px">
          <Grid gap={4}>
            <HStack>
              <Text textStyle={"smBold"} flex={1}>
                SMS Notifications
              </Text>
              <Checkbox
                isDisabled={isPending}
                colorScheme="brandYellow"
                isChecked={smsNotificationsEnabled}
                onChange={(e) => setSmsNotificationsEnabled(e.target.checked)}
              />
            </HStack>
          </Grid>
        </GridItem>
      </Grid>
      <HStack mt={6} justify={"flex-end"}>
        <Button
          onClick={onButtonPress}
          colorScheme="brandYellow"
          textColor="brandBlue.800"
          isDisabled={isPending}
        >
          Save changes
        </Button>
      </HStack>
    </>
  );
};

export default NotificationsTab;
