import { useState, useEffect } from "react";

export const useValidName = (initialValue: string | null) => {
  const [firstName, setFirstName] = useState(initialValue);
  const [nameIsValid, setNameIsValid] = useState("");

  useEffect(() => {
    if (firstName !== null) {
      if (firstName.length === 0) {
        setNameIsValid("The name is required");
        return;
      }
    } else {
      setNameIsValid("");
      return;
    }

    setNameIsValid("");
  }, [firstName]);

  return { firstName, setFirstName, nameIsValid };
};
