import { useState, useEffect } from "react";

import * as yup from "yup";

export const useValidEmail = (initialValue: string | null) => {
  const [email, setEmail] = useState(initialValue);
  const [emailIsValid, setEmailIsValid] = useState("");

  useEffect(() => {
    const emailSchema = yup.object().shape({
      email: yup.string().email().required(),
    });

    if (email !== null) {
      if (email.length === 0) {
        setEmailIsValid("The email is required");
        return;
      }
    } else {
      setEmailIsValid("");
      return;
    }

    const isValid = emailSchema.isValidSync({ email });
    if (!isValid) {
      setEmailIsValid("We need a valid email address.");
      return;
    }
    setEmailIsValid("");
  }, [email]);

  return { email, setEmail, emailIsValid };
};
