import * as yup from "yup";

const LETTERS_ONLY_REGEX = /^[A-Za-z]+$/;
const LETTERS_AND_SPACES_REGEX = /^[A-Za-z\s]+$/;
const FULL_NAME_EXAMPLE_MESSAGE =
  "Enter your full name as per PAN";

// Step 1 — Name + Mobile + Consents
export const stage1Schema = yup.object({
  fullName: yup
    .string()
    .trim()
    .min(5, FULL_NAME_EXAMPLE_MESSAGE)
    .matches(LETTERS_AND_SPACES_REGEX, "Name must contain only letters")
    .test(
      "full-name-format",
      FULL_NAME_EXAMPLE_MESSAGE,
      (value) => {
        const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];

        return parts.length >= 2 && parts.every((part) => part.length >= 2);
      }
    )
    .required("Name is required"),

  firstName: yup
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .matches(LETTERS_ONLY_REGEX, "First name must contain only letters")
    .required("First name is required"),

  lastName: yup
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .matches(LETTERS_ONLY_REGEX, "Last name must contain only letters")
    .required("Last name is required"),

  mobile: yup
    .string()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .required("Mobile number is required"),
  loan_amount: yup
    .number()
    .transform((_value, original) => (original === "" ? undefined : Number(original)))
    .min(5000, "Minimum loan amount is ₹5,000")
    .max(200000, "Maximum loan amount is ₹2,00,000")
    .required("Loan amount is required"),
  consent_tnc: yup
    .boolean()
    .oneOf([true], "You must agree to the Terms & Conditions and Privacy Policy")
    .required(),
  consent_credit: yup
    .boolean()
    .oneOf([true], "You must consent to credit information access")
    .required(),
  consent_communication: yup
    .boolean()
    .oneOf([true], "You must consent to receive communications")
    .required(),
});

// Step 2 — All other fields
export const stage2Schema = yup.object({
  first_name: yup
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long")
    .matches(/^[A-Za-z]+$/, "First name must contain only letters")
    .required("First name is required"),
  last_name: yup
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long")
    .matches(/^[A-Za-z]+$/, "Last name must contain only letters")
    .required("Last name is required"),
  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .matches(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      "Invalid email"
    )
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
    .min(
      new Date(new Date().setFullYear(new Date().getFullYear() - 75)),
      "Enter a valid date of birth"
    )
    .required("Date of Birth is required"),
  profile: yup
    .string()
    .oneOf(
      ["Salaried", "Self Employed"],
      "Select a valid job type"
    )
    .required("Job Type is required"),
  monthly_income: yup
    .number()
    .transform((_value, original) =>
      original === "" || original === null || original === undefined
        ? undefined
        : Number(String(original).replace(/\D/g, ""))
    )
    .typeError("Income must be a number")
    .integer("Income must be a whole number")
    .positive("Income must be positive")
    .min(1000, "Income must be at least ₹1,000")
    .max(100000000, "Enter a valid monthly income")
    .required("Monthly Income is required"),
  loan_purpose: yup
    .string()
    .oneOf(
      [
        "Home Renovation",
        "Medical Emergency",
        "Wedding or Family Function",
        "Renovate or Repair Home",
        "Buy a Gadget or Appliance",
        "Travel or Vacation",
        "Education or Coaching Fees",
        "Start a Small Business or Side Hustle",
        "Rent or Deposit Payments",
        "Pay School Fees or Tuition",
        "Vechical Repair or Fuel Expenses",
        "Support Family Expenses",
        "Build or Improve Credit Score",
        "Just for Short-Term Cash Need",
        "Others",
      ],
      "Select a valid loan purpose"
    )
    .required("Loan purpose is required"),
});
