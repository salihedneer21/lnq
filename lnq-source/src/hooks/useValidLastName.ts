import { useState, useEffect } from "react";

export const useValidLastName = (initialValue: string | null) => {
  const [lastName, setLastName] = useState(initialValue);
  const [lastNameIsValid, setLastNameIsValid] = useState("");

  useEffect(() => {
    if (lastName !== null) {
      if (lastName.length === 0) {
        setLastNameIsValid("The name is required");
        return;
      }
    } else {
      setLastNameIsValid("");
      return;
    }

    setLastNameIsValid("");
  }, [lastName]);

  return { lastName, setLastName, lastNameIsValid };
};
