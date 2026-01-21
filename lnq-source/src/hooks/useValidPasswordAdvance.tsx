/* eslint-disable */
import { useState, useEffect } from 'react';
import * as yup from 'yup';

export const useValidPasswordAdvance = (initialValue: string | null) => {
  const [passwordAdvance, setPasswordAdvance] = useState(initialValue);
  let errorsMessages = [
    { active: false, text: 'Must be at least 8 symbols' },
    { active: false, text: 'Must contain uppercase letter' },
    { active: false, text: 'Must contain lowercase letter' },
    { active: false, text: 'Must contain number' },
    { active: false, text: 'Must contain symbol' },
  ];

  const [passwordAdvanceIsValid, setPasswordAdvanceIsValid] =
    useState(errorsMessages);
  useEffect(() => {
    const passwordLengthSchema = yup.object().shape({
      passwordAdvance: yup.string().min(8, 'Must be at least 8 symbols'),
    });

    const passwordUppercaseSchema = yup.object().shape({
      passwordAdvance: yup
        .string()
        .matches(/(?=.*[A-Z])/, 'Must contain uppercase letter'),
    });

    const passwordLowercaseSchema = yup.object().shape({
      passwordAdvance: yup
        .string()
        .matches(/(?=.*[a-z])/, 'Must contain lowercase letter'),
    });

    const passwordNumberSchema = yup.object().shape({
      passwordAdvance: yup
        .string()
        .matches(/(?=.*\d)/, { message: 'Must contain number' }),
    });

    const passwordSymbolSchema = yup.object().shape({
      passwordAdvance: yup
        .string()
        .matches(/(?=.*[!@#$%^&*,.:;])/, 'Must contain symbol'),
    });

    errorsMessages[0].active = passwordLengthSchema.isValidSync({
      passwordAdvance,
    });
    errorsMessages[1].active = passwordUppercaseSchema.isValidSync({
      passwordAdvance,
    });
    errorsMessages[2].active = passwordLowercaseSchema.isValidSync({
      passwordAdvance,
    });
    errorsMessages[3].active = passwordNumberSchema.isValidSync({
      passwordAdvance,
    });
    errorsMessages[4].active = passwordSymbolSchema.isValidSync({
      passwordAdvance,
    });

    const founded = errorsMessages.find((element) => !element.active);
    if (founded) {
      setPasswordAdvanceIsValid(errorsMessages);
      return;
    }

    setPasswordAdvanceIsValid([
      { active: true, text: 'Password Strength: Good' },
    ]);
  }, [passwordAdvance]);

  return { passwordAdvance, setPasswordAdvance, passwordAdvanceIsValid };
};
