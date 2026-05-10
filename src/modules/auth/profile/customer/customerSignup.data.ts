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

export const BUILDER_USER_TYPE_OPTIONS: Array<{
  label: string;
  value: Exclude<SignupUserType, "CUSTOMER">;
}> = [
  { label: "Fundi", value: "FUNDI" },
  { label: "Professional", value: "PROFESSIONAL" },
  { label: "Contractor", value: "CONTRACTOR" },
  { label: "Hardware", value: "HARDWARE" },
];

export const BUILDER_USER_TYPE_DESCRIPTIONS: Record<
  Exclude<SignupUserType, "CUSTOMER">,
  string
> = {
  FUNDI:
    "For skilled artisans and technicians offering practical construction and repair services.",
  PROFESSIONAL:
    "For certified experts such as architects, engineers, and quantity surveyors.",
  CONTRACTOR:
    "For registered contractors managing labor, site execution, and project delivery.",
  HARDWARE:
    "For hardware suppliers and stores providing construction materials and equipment.",
};
