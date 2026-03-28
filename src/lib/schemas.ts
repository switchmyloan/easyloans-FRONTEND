import * as yup from "yup";

// Step 1 — Name + Mobile only
export const stage1Schema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .matches(/^[A-Za-z\s]+$/, "Name must contain only letters")
    .required("Name is required"),
  mobile: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .required("Mobile number is required"),
});

// Step 2 — All other fields
export const stage2Schema = yup.object({
  first_name: yup
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .matches(/^[A-Za-z\s]+$/, "First name must contain only letters")
    .required("First name is required"),
  last_name: yup
    .string()
    .trim()
    .min(1, "Last name is required")
    .matches(/^[A-Za-z\s]+$/, "Last name must contain only letters")
    .required("Last name is required"),
  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),
  gender: yup
    .string()
    .oneOf(["Male", "Female", "Other"], "Select a valid gender")
    .required("Gender is required"),
  pincode: yup
    .string()
    .matches(/^[1-9]\d{5}$/, "Pin Code must be 6 digits")
    .required("Pin Code is required"),
  pan_no: yup
    .string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. ABCDE1234F)")
    .required("PAN is required"),
  dob: yup
    .date()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr))
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      "You must be at least 18 years old"
    )
    .required("Date of Birth is required"),
  profile: yup
    .string()
    .oneOf(
      ["Salaried", "Self Employed", "Business Owner", "Freelancer", "Student", "Other"],
      "Select a valid job type"
    )
    .required("Job Type is required"),
  monthly_income: yup
    .number()
    .typeError("Income must be a number")
    .positive("Income must be positive")
    .min(1000, "Income must be at least ₹1,000")
    .required("Monthly Income is required"),
});
