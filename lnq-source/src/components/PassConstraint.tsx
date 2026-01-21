/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Grid, HStack } from "@chakra-ui/react";
import { FiCheck, FiX } from "react-icons/fi";
import { THEME_COLORS } from "../base/theme/foundations/colors";

interface Props {
  confirmPassError?: string;
  passwordAdvanceIsValid: {
    active: boolean;
    text: string;
  }[];
}

const PassConstraint = (props: Props) => (
  <Grid mt={2}>
    {props.passwordAdvanceIsValid.map((i: any) => {
      if (i.text)
        return (
          <HStack key={i?.text as string}>
            <FiCheck
              style={{
                color: i.active ? THEME_COLORS.brandBlue[800] : THEME_COLORS.primary[100],
              }}
            />
            <p
              style={{
                color: i.active ? THEME_COLORS.brandBlue[800] : THEME_COLORS.primary[100],
              }}
            >
              {i.text}
            </p>
          </HStack>
        );
    })}
    {props.confirmPassError && (
      <HStack>
        {props.confirmPassError === "Passwords match" ? (
          <FiCheck style={{ color: THEME_COLORS.brandBlue[800] }} />
        ) : (
          <FiX style={{ color: "red" }} />
        )}
        <p
          style={{
            color:
              props.confirmPassError === "Passwords match"
                ? THEME_COLORS.brandBlue[800]
                : THEME_COLORS.error[400],
          }}
        >
          {props.confirmPassError}
        </p>
      </HStack>
    )}
  </Grid>
);

export default PassConstraint;
