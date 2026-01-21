import { useState } from "react";
import { useIMask } from "react-imask";

export const useValidPhoneMask = (initialValue?: string) => {
  const [value, setValue] = useState(initialValue ?? "");
  const [parsedPhone, setParsedPhone] = useState<string | null>(
    initialValue ? `+${initialValue.replace(/\D/g, "")}` : null,
  );
  const [invalidPhoneError, setInvalidPhoneError] = useState("");

  const { ref, setValue: setIValue } = useIMask(
    {
      mask: "+0 (000) 000-0000",
    },
    {
      onAccept: (value) => {
        if (value.length === 0 || value.match(/\d/g)?.length === 11) {
          setInvalidPhoneError("");
        } else {
          setInvalidPhoneError("Invalid phone number");
        }
        setParsedPhone(value ? `+${value.replace(/\D/g, "")}` : null);
        setValue(value);
      },
    },
  );

  return {
    ref,
    phone: value,
    invalidPhoneError,
    parsedPhone,
    setInitialPhoneValue: setIValue,
  };
};
