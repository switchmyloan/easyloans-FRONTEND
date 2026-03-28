import * as yup from "yup";

// Step 1 — Name + Mobile only
export const stage1Schema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  mobile: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .required("Mobile number is required"),
});

// Step 2 — All other fields
export const stage2Schema = yup.object({
  last_name: yup
    .string()
    .min(1, "Last name is required")
    .required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  gender: yup.string().required("Gender is required"),
  pincode: yup
    .string()
    .matches(/^[1-9]\d{5}$/, "Pin Code must be 6 digits")
    .required("Pin Code is required"),
  pan_no: yup
    .string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
    .required("PAN is required"),
  dob: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr))
    .required("Date of Birth is required"),
  profile: yup.string().required("Job Type is required"),
  monthly_income: yup
    .number()
    .typeError("Income must be a number")
    .positive("Income must be positive")
    .required("Monthly Income is required"),
});
