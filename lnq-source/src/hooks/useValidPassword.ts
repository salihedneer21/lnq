import { useState, useEffect } from "react";
import * as yup from "yup";

export const useValidPassword = (initialValue: string) => {
  const [password, setPassword] = useState(initialValue);
  const [passwordIsValid, setPasswordIsValid] = useState("");

  useEffect(() => {
    const passwordSchema = yup.object().shape({
      password: yup.string().min(8).required(),
    });

    if (password) {
      if (password.length === 0) {
        setPasswordIsValid("password can't be empty.");
        return;
      }
    } else {
      setPasswordIsValid("");
      return;
    }

    const isValid = passwordSchema.isValidSync({ password });
    if (!isValid) {
      setPasswordIsValid("Ooops! We need a valid password (+8 digits).");
      return;
    }

    setPasswordIsValid("");
  }, [password]);

  return { password, setPassword, passwordIsValid };
};
