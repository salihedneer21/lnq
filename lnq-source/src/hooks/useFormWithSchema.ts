import { ObjectSchema } from "yup";
import { FormikHelpers, useFormik } from "formik";

const useFormWithSchema = <T extends object>(
  schema: ObjectSchema<T>,
  onSubmit: (
    values: Partial<T>,
    formikHelpers: FormikHelpers<Partial<T>>,
  ) => void | Promise<any>,
  initialValues: Partial<T>,
) => {
  const form = useFormik({
    validationSchema: schema,
    initialValues,
    onSubmit,
  });

  return form;
};

export default useFormWithSchema;
