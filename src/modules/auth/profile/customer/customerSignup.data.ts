export type SignupUserType =
  | "CUSTOMER"
  | "FUNDI"
  | "PROFESSIONAL"
  | "CONTRACTOR"
  | "HARDWARE";

export type CustomerAccountType = "INDIVIDUAL" | "ORGANIZATION";

export const SIGNUP_USER_TYPE_OPTIONS: Array<{
  label: string;
  value: SignupUserType;
  icon: string;
}> = [
  { label: "Customer", value: "CUSTOMER", icon: "account-outline" },
  { label: "Fundi", value: "FUNDI", icon: "hammer-wrench" },
  { label: "Professional", value: "PROFESSIONAL", icon: "badge-account-outline" },
  { label: "Contractor", value: "CONTRACTOR", icon: "hard-hat" },
  { label: "Hardware", value: "HARDWARE", icon: "storefront-outline" },
];

export const CUSTOMER_ACCOUNT_TYPES: Array<{
  label: string;
  value: CustomerAccountType;
}> = [
  { label: "Individual", value: "INDIVIDUAL" },
  { label: "Organization", value: "ORGANIZATION" },
];

export const CUSTOMER_ACCOUNT_TYPE_DESCRIPTIONS: Record<CustomerAccountType, string> =
  {
    INDIVIDUAL:
      "These are Individuals seeking construction services for personal projects e.g home renovations, repairs or new construction",
    ORGANIZATION: "Register as a group,business, corporation or institution",
  };
