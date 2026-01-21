import { useState, useEffect } from "react";
import * as yup from "yup";

export const useValidCode = (initialValue: string | null) => {
  const [code, setCode] = useState(initialValue);
  const [codeIsValid, setCodeIsValid] = useState("");

  useEffect(() => {
    const codeSchema = yup.object().shape({
      code: yup.string().max(6).min(6).required(),
    });

    if (code) {
      if (code.length === 0) {
        setCodeIsValid("Email can't be empty.");
        return;
      }
    } else {
      setCodeIsValid("");
      return;
    }
    const isValid = codeSchema.isValidSync({ code });
    if (!isValid) {
      setCodeIsValid("Ooops! We need a valid code (6 digits).");
      return;
    }
    setCodeIsValid("");
  }, [code]);

  return { code, setCode, codeIsValid };
};
