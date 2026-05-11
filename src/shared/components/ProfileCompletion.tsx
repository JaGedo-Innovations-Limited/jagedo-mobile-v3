import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Button,
  Card,
  HelperText,
  ProgressBar,
  Surface,
  TextInput,
} from "react-native-paper";

import { countySubCountyMap, kenyanCounties } from "../constants/profileCompletion";
import { CONTRACTOR_SPECIALIZATIONS } from "../constants/experience";
import {
  FUNDI_SKILL_OPTIONS,
  HARDWARE_TYPE_OPTIONS,
  PROFESSIONAL_OPTIONS,
} from "../constants/skill";
import { saveProfileData } from "../utils/profileStorage";
import OptionPickerModal from "./OptionPickerModal";

type CompleteProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  userType?: string;
  selectedSkill?: string;
  initialEmail?: string;
  initialPhone?: string;
};

type NormalizedUserType = "CUSTOMER" | "FUNDI" | "PROFESSIONAL" | "CONTRACTOR" | "HARDWARE";
type CustomerAccountType = "INDIVIDUAL" | "ORGANIZATION";

type PickerType =
  | "county"
  | "subCounty"
  | "customerAccountType"
  | "fundiSkill"
  | "profession"
  | "contractorType"
  | "hardwareGroup"
  | "heardAbout"
  | "socialPlatform"
  | "serviceInterest"
  | null;

const STEP_LABELS = ["Personal", "Location", "Source", "Verify"];
const HEARD_ABOUT_OPTIONS = [
  "Search Engine",
  "Social Media",
  "Word of Mouth",
  "Advertisement",
  "Direct Referral",
  "Other",
];
const SOCIAL_PLATFORM_OPTIONS = [
  "Facebook",
  "Instagram",
  "Twitter / X",
  "TikTok",
  "WhatsApp",
  "YouTube",
  "LinkedIn",
  "Other",
];
const SERVICE_INTEREST_OPTIONS = ["Fundi", "Professional", "Contractor", "Hardware"];
const CUSTOMER_ACCOUNT_OPTIONS: CustomerAccountType[] = ["INDIVIDUAL", "ORGANIZATION"];
const CONTRACTOR_TYPE_OPTIONS = Object.keys(CONTRACTOR_SPECIALIZATIONS);

const normalizeUserType = (value?: string): NormalizedUserType => {
  const upper = String(value || "").trim().toUpperCase();
  if (upper === "FUNDI") return "FUNDI";
  if (upper === "PROFESSIONAL") return "PROFESSIONAL";
  if (upper === "CONTRACTOR") return "CONTRACTOR";
  if (upper === "HARDWARE") return "HARDWARE";
  return "CUSTOMER";
};

const formatCustomerAccountType = (value: CustomerAccountType) =>
  value === "INDIVIDUAL" ? "Individual" : "Organization";

const getStepIcon = (step: number) => {
  if (step === 1) return "account-outline";
  if (step === 2) return "map-marker-outline";
  if (step === 3) return "message-outline";
  return "shield-check-outline";
};

const ProfileCompletion = ({
  visible,
  onClose,
  userType = "Customer",
  selectedSkill = "",
  initialEmail = "",
  initialPhone = "",
}: CompleteProfileModalProps) => {
  const normalizedUserType = useMemo(() => normalizeUserType(userType), [userType]);
  const isCustomer = normalizedUserType === "CUSTOMER";

  const [step, setStep] = useState(1);
  const [openPicker, setOpenPicker] = useState<PickerType>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [customerAccountType, setCustomerAccountType] = useState<CustomerAccountType | "">("");
  const [fundiSkill, setFundiSkill] = useState("");
  const [profession, setProfession] = useState("");
  const [contractorTypes, setContractorTypes] = useState<string[]>([]);
  const [hardwareGroups, setHardwareGroups] = useState<string[]>([]);

  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [town, setTown] = useState("");
  const [estate, setEstate] = useState("");

  const [heardAbout, setHeardAbout] = useState("");
  const [referralDetail, setReferralDetail] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("");
  const [socialMediaOther, setSocialMediaOther] = useState("");
  const [serviceInterest, setServiceInterest] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);

  const totalSteps = 4;
  const progress = step / totalSteps;

  const availableSubCounties = useMemo(() => {
    if (!county) return [];
    return countySubCountyMap[county] || [];
  }, [county]);

  const resetForm = () => {
    setStep(1);
    setOpenPicker(null);
    setErrors({});
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setCustomerAccountType("");
    setFundiSkill("");
    setProfession("");
    setContractorTypes([]);
    setHardwareGroups([]);
    setCounty("");
    setSubCounty("");
    setTown("");
    setEstate("");
    setHeardAbout("");
    setReferralDetail("");
    setSocialPlatform("");
    setSocialMediaOther("");
    setServiceInterest("");
    setOtpSent(false);
    setOtpCode("");
    setOtpVerified(false);
    setIsSendingOtp(false);
    setIsVerifyingOtp(false);
    setResendTimer(120);
    setCanResend(false);
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    if (selectedSkill) {
      setFundiSkill(selectedSkill);
    }
  }, [selectedSkill]);

  useEffect(() => {
    if (!visible) return;

    if (initialEmail && !email) {
      setEmail(initialEmail);
    }

    if (initialPhone && !phone) {
      setPhone(initialPhone);
    }
  }, [email, initialEmail, initialPhone, phone, visible]);

  useEffect(() => {
    if (!otpSent || canResend) return;

    const interval = setInterval(() => {
      setResendTimer((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [otpSent, canResend]);

  useEffect(() => {
    if (step === 4 && email.trim() && !otpSent && !isSendingOtp) {
      void handleSendOtp();
    }
  }, [step, email, otpSent, isSendingOtp]);

  useEffect(() => {
    if (step === 4 && /^\d{6}$/.test(otpCode) && !otpVerified && !isVerifyingOtp) {
      void handleVerifyOtp();
    }
  }, [step, otpCode, otpVerified, isVerifyingOtp]);

  useEffect(() => {
    if (step === 4 && otpVerified) {
      const timeout = setTimeout(() => {
        void handleProfileCompletion();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [step, otpVerified]);

  const pickerConfig = useMemo(() => {
    switch (openPicker) {
      case "county":
        return {
          title: "Select county",
          options: kenyanCounties,
          onSelect: (value: string) => {
            setCounty(value);
            setSubCounty("");
            setOpenPicker(null);
          },
        };
      case "subCounty":
        return {
          title: "Select sub-county",
          options: availableSubCounties,
          onSelect: (value: string) => {
            setSubCounty(value);
            setOpenPicker(null);
          },
        };
      case "customerAccountType":
        return {
          title: "Select account type",
          options: CUSTOMER_ACCOUNT_OPTIONS.map(formatCustomerAccountType),
          onSelect: (value: string) => {
            const nextType = value.toUpperCase() as CustomerAccountType;
            setCustomerAccountType(nextType);
            setOpenPicker(null);
          },
        };
      case "fundiSkill":
        return {
          title: "Select your skill",
          options: FUNDI_SKILL_OPTIONS,
          onSelect: (value: string) => {
            setFundiSkill(value);
            setOpenPicker(null);
          },
        };
      case "profession":
        return {
          title: "Select profession",
          options: PROFESSIONAL_OPTIONS,
          onSelect: (value: string) => {
            setProfession(value);
            setOpenPicker(null);
          },
        };
      case "contractorType":
        return {
          title: "Select contractor type",
          options: CONTRACTOR_TYPE_OPTIONS,
          onSelect: (value: string) => {
            setContractorTypes([value]);
            setOpenPicker(null);
          },
        };
      case "hardwareGroup":
        return {
          title: "Select hardware group",
          options: HARDWARE_TYPE_OPTIONS,
          onSelect: (value: string) => {
            setHardwareGroups([value]);
            setOpenPicker(null);
          },
        };
      case "heardAbout":
        return {
          title: "How did you hear about us?",
          options: HEARD_ABOUT_OPTIONS,
          onSelect: (value: string) => {
            setHeardAbout(value);
            setReferralDetail("");
            setSocialPlatform("");
            setSocialMediaOther("");
            setOpenPicker(null);
          },
        };
      case "socialPlatform":
        return {
          title: "Select social platform",
          options: SOCIAL_PLATFORM_OPTIONS,
          onSelect: (value: string) => {
            setSocialPlatform(value);
            setOpenPicker(null);
          },
        };
      case "serviceInterest":
        return {
          title: "Select service",
          options: SERVICE_INTEREST_OPTIONS,
          onSelect: (value: string) => {
            setServiceInterest(value);
            setOpenPicker(null);
          },
        };
      default:
        return null;
    }
  }, [availableSubCounties, openPicker]);

  const closeModal = () => {
    setOpenPicker(null);
    onClose();
  };

  const toggleContractorType = (value: string) => {
    setContractorTypes((current) => {
      const next = current.includes(value)
        ? current.filter((option) => option !== value)
        : [...current, value];

      return CONTRACTOR_TYPE_OPTIONS.filter((option) => next.includes(option));
    });

    setErrors((current) => {
      const next = { ...current };
      delete next.contractorType;
      return next;
    });
  };

  const toggleHardwareGroup = (value: string) => {
    setHardwareGroups((current) => {
      const next = current.includes(value)
        ? current.filter((option) => option !== value)
        : [...current, value];

      return HARDWARE_TYPE_OPTIONS.filter((option) => next.includes(option));
    });

    setErrors((current) => {
      const next = { ...current };
      delete next.hardwareGroup;
      return next;
    });
  };

  const isValidKenyanPhone = (value: string) => /^(07|01)\d{8}$/.test(value.replace(/\D/g, ""));

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (firstName.trim().length < 2) nextErrors.firstName = "First name is required.";
      if (lastName.trim().length < 2) nextErrors.lastName = "Last name is required.";
      if (!/\S+@\S+\.\S+/.test(email.trim())) nextErrors.email = "Enter a valid email address.";
      if (!isValidKenyanPhone(phone)) nextErrors.phone = "Use a valid Kenyan number (07/01).";

      if (isCustomer && !customerAccountType) {
        nextErrors.customerAccountType = "Select account type.";
      }

      if (normalizedUserType === "FUNDI" && !fundiSkill) {
        nextErrors.fundiSkill = "Select your skill.";
      }

      if (normalizedUserType === "PROFESSIONAL" && profession.trim().length < 2) {
        nextErrors.profession = "Enter your profession.";
      }

      if (normalizedUserType === "CONTRACTOR" && contractorTypes.length === 0) {
        nextErrors.contractorType = "Select contractor type.";
      }

      if (normalizedUserType === "HARDWARE" && hardwareGroups.length === 0) {
        nextErrors.hardwareGroup = "Select hardware group.";
      }
    }

    if (step === 2) {
      if (!county) nextErrors.county = "County is required.";
      if (!subCounty) nextErrors.subCounty = "Sub-county is required.";
      if (town.trim().length < 2) nextErrors.town = "Town/City is required.";
      if (estate.trim().length < 2) nextErrors.estate = "Estate/Village is required.";
    }

    if (step === 3) {
      if (!heardAbout) {
        nextErrors.heardAbout = "Please tell us how you heard about us.";
      }

      if (heardAbout === "Social Media") {
        if (!socialPlatform) {
          nextErrors.socialPlatform = "Select a social platform.";
        }
        if (socialPlatform === "Other" && socialMediaOther.trim().length < 2) {
          nextErrors.socialMediaOther = "Please specify the platform.";
        }
      }

      if (heardAbout === "Direct Referral" && referralDetail.trim().length < 2) {
        nextErrors.referralDetail = "Please tell us who referred you.";
      }

      if (heardAbout === "Other" && referralDetail.trim().length < 2) {
        nextErrors.referralDetail = "Please share where you heard about us.";
      }

      if (isCustomer && !serviceInterest) {
        nextErrors.serviceInterest = "Select the service you are looking for.";
      }
    }

    if (step === 4 && !otpVerified) {
      nextErrors.otp = "Please verify your email to continue.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setErrors((current) => ({
        ...current,
        email: "Enter a valid email address before verification.",
      }));
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setOtpVerified(false);
      setOtpCode("");
      setResendTimer(120);
      setCanResend(false);
      setErrors((current) => {
        const next = { ...current };
        delete next.otp;
        return next;
      });
    }, 700);
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otpCode)) {
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setOtpVerified(true);
      setErrors((current) => {
        const next = { ...current };
        delete next.otp;
        return next;
      });
    }, 800);
  };

  const handleProfileCompletion = async () => {
    const profilePayload = {
      userType: normalizedUserType,
      accountType: customerAccountType || "",
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      fundiSkill,
      profession,
      contractorType: contractorTypes.join(", "),
      hardwareGroup: hardwareGroups.join(", "),
      county,
      subCounty,
      town,
      estate,
      heardAbout,
      referralDetail,
      socialPlatform,
      socialMediaOther,
      serviceInterest,
    };

    await saveProfileData(profilePayload);

    closeModal();
    router.push({
      pathname: "/profile",
      params: profilePayload,
    });
  };

  const handleContinue = () => {
    if (!validateStep()) return;

    if (step === totalSteps) {
      void handleProfileCompletion();
      return;
    }

    setErrors({});
    setStep((current) => current + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      closeModal();
      return;
    }

    setErrors({});
    setStep((current) => current - 1);
  };

  const stepTitle = STEP_LABELS[step - 1];

  const StepIndicator = (
    <View className="mb-4 mt-2 flex-row items-start justify-between">
      {STEP_LABELS.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < step;
        const isCurrent = stepNumber === step;

        return (
          <React.Fragment key={label}>
            <View className="items-center">
              <Surface
                elevation={isCurrent ? 2 : 0}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isCompleted ? "#22C55E" : isCurrent ? "#2563EB" : "#F1F5F9",
                  borderWidth: isCurrent ? 2 : 0,
                  borderColor: isCurrent ? "#DBEAFE" : "transparent",
                }}
              >
                {isCompleted ? (
                  <Feather name="check" size={17} color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons
                    name={getStepIcon(stepNumber)}
                    size={17}
                    color={isCurrent ? "#FFFFFF" : "#94A3B8"}
                  />
                )}
              </Surface>
              <Text
                className={`mt-1 text-[11px] ${
                  isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-slate-400"
                }`}
              >
                {label}
              </Text>
            </View>

            {stepNumber < totalSteps ? (
              <View
                className={`mx-2 mt-4 h-[2px] flex-1 rounded-full ${
                  stepNumber < step ? "bg-green-500" : "bg-slate-200"
                }`}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );

  const StepOne = (
    <View className="gap-3">
      <View className="items-center py-1">
        <Surface
          elevation={0}
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#EFF6FF",
          }}
        >
          <MaterialCommunityIcons name="account-outline" size={30} color="#2563EB" />
        </Surface>
        <Text className="mt-4 text-center text-[24px] font-bold text-slate-800">Personal Details</Text>
        <Text className="mt-1 text-center text-sm text-slate-500">Tell us about yourself</Text>
      </View>

      <TextInput
        mode="outlined"
        label="First Name *"
        value={firstName}
        onChangeText={setFirstName}
        error={Boolean(errors.firstName)}
        outlineColor="#CBD5E1"
        activeOutlineColor="#2563EB"
      />
      <HelperText type="error" visible={Boolean(errors.firstName)}>
        {errors.firstName}
      </HelperText>

      <TextInput
        mode="outlined"
        label="Last Name *"
        value={lastName}
        onChangeText={setLastName}
        error={Boolean(errors.lastName)}
        outlineColor="#CBD5E1"
        activeOutlineColor="#2563EB"
      />
      <HelperText type="error" visible={Boolean(errors.lastName)}>
        {errors.lastName}
      </HelperText>

      <TextInput
        mode="outlined"
        label="Email Address *"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={Boolean(errors.email)}
        outlineColor="#CBD5E1"
        activeOutlineColor="#2563EB"
      />
      <HelperText type="error" visible={Boolean(errors.email)}>
        {errors.email}
      </HelperText>

      <TextInput
        mode="outlined"
        label="Phone Number *"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        error={Boolean(errors.phone)}
        outlineColor="#CBD5E1"
        activeOutlineColor="#2563EB"
      />
      <HelperText type="error" visible={Boolean(errors.phone)}>
        {errors.phone}
      </HelperText>

      {isCustomer ? (
        <>
          <Pressable onPress={() => setOpenPicker("customerAccountType")}>
            <TextInput
              mode="outlined"
              label="Customer Account Type *"
              value={customerAccountType ? formatCustomerAccountType(customerAccountType) : ""}
              placeholder="Select Individual or Organization"
              editable={false}
              right={<TextInput.Icon icon="chevron-down" />}
              error={Boolean(errors.customerAccountType)}
              outlineColor="#CBD5E1"
              activeOutlineColor="#2563EB"
            />
          </Pressable>
          <HelperText type="error" visible={Boolean(errors.customerAccountType)}>
            {errors.customerAccountType}
          </HelperText>
        </>
      ) : null}

      {normalizedUserType === "FUNDI" ? (
        <>
          <Pressable onPress={() => setOpenPicker("fundiSkill")}>
            <TextInput
              mode="outlined"
              label="Skill *"
              value={fundiSkill}
              placeholder="Select your skill"
              editable={false}
              right={<TextInput.Icon icon="chevron-down" />}
              error={Boolean(errors.fundiSkill)}
              outlineColor="#CBD5E1"
              activeOutlineColor="#2563EB"
            />
          </Pressable>
          <HelperText type="error" visible={Boolean(errors.fundiSkill)}>
            {errors.fundiSkill}
          </HelperText>
        </>
      ) : null}

      {normalizedUserType === "PROFESSIONAL" ? (
        <>
          <Pressable onPress={() => setOpenPicker("profession")}>
            <TextInput
              mode="outlined"
              label="Profession *"
              value={profession}
              placeholder="Select profession"
              editable={false}
              right={<TextInput.Icon icon="chevron-down" />}
              error={Boolean(errors.profession)}
              outlineColor="#CBD5E1"
              activeOutlineColor="#2563EB"
            />
          </Pressable>
          <HelperText type="error" visible={Boolean(errors.profession)}>
            {errors.profession}
          </HelperText>
        </>
      ) : null}

      {normalizedUserType === "CONTRACTOR" ? (
        <>
          <Pressable onPress={() => setOpenPicker("contractorType")}>
            <TextInput
              mode="outlined"
              label="Contractor Type *"
              value={contractorTypes.join(", ")}
              placeholder="Select contractor type"
              editable={false}
              right={<TextInput.Icon icon="chevron-down" />}
              error={Boolean(errors.contractorType)}
              outlineColor="#CBD5E1"
              activeOutlineColor="#2563EB"
            />
          </Pressable>
          <HelperText type="error" visible={Boolean(errors.contractorType)}>
            {errors.contractorType}
          </HelperText>
        </>
      ) : null}

      {normalizedUserType === "HARDWARE" ? (
        <>
          <Pressable onPress={() => setOpenPicker("hardwareGroup")}>
            <TextInput
              mode="outlined"
              label="Hardware Group *"
              value={hardwareGroups.join(", ")}
              placeholder="Select hardware group"
              editable={false}
              right={<TextInput.Icon icon="chevron-down" />}
              error={Boolean(errors.hardwareGroup)}
              outlineColor="#CBD5E1"
              activeOutlineColor="#2563EB"
            />
          </Pressable>
          <HelperText type="error" visible={Boolean(errors.hardwareGroup)}>
            {errors.hardwareGroup}
          </HelperText>
        </>
      ) : null}
    </View>
  );

  const StepTwo = (
    <View className="gap-3">
      <View className="items-center py-1">
        <Surface
          elevation={0}
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ECFDF5",
          }}
        >
          <MaterialCommunityIcons name="map-marker-outline" size={30} color="#10B981" />
        </Surface>
        <Text className="mt-4 text-center text-[24px] font-bold text-slate-800">Location Information</Text>
        <Text className="mt-1 text-center text-sm text-slate-500">Where are you based?</Text>
      </View>

      <View>
        <Text className="mb-2 text-sm text-slate-700">Country *</Text>
        <View className="flex-row items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-3">
          <View className="h-4 w-6 overflow-hidden rounded-sm border border-slate-300">
            <View className="h-[4px] bg-black" />
            <View className="h-[1px] bg-white" />
            <View className="h-[3px] bg-red-700" />
            <View className="h-[1px] bg-white" />
            <View className="h-[5px] bg-green-700" />
          </View>
          <Text className="font-medium text-slate-700">Kenya</Text>
        </View>
      </View>

      <Pressable onPress={() => setOpenPicker("county")}>
        <TextInput
          mode="outlined"
          label="County *"
          value={county}
          placeholder="Select county"
          editable={false}
          right={<TextInput.Icon icon="chevron-down" />}
          error={Boolean(errors.county)}
          outlineColor="#CBD5E1"
          activeOutlineColor="#2563EB"
        />
      </Pressable>
      <HelperText type="error" visible={Boolean(errors.county)}>
        {errors.county}
      </HelperText>

      <Pressable onPress={() => setOpenPicker("subCounty")}>
        <TextInput
          mode="outlined"
          label="Sub-County *"
          value={subCounty}
          placeholder={county ? "Select sub-county" : "Select county first"}
          editable={false}
          right={<TextInput.Icon icon="chevron-down" />}
          error={Boolean(errors.subCounty)}
          outlineColor="#CBD5E1"
          activeOutlineColor="#2563EB"
        />
      </Pressable>
      <HelperText type="error" visible={Boolean(errors.subCounty)}>
        {errors.subCounty}
      </HelperText>

      <TextInput
        mode="outlined"
        label="Town/City *"
        value={town}
        onChangeText={setTown}
        error={Boolean(errors.town)}
        outlineColor="#CBD5E1"
        activeOutlineColor="#2563EB"
      />
      <HelperText type="error" visible={Boolean(errors.town)}>
        {errors.town}
      </HelperText>

      <TextInput
        mode="outlined"
        label="Estate/Village *"
        value={estate}
        onChangeText={setEstate}
        error={Boolean(errors.estate)}
        outlineColor="#CBD5E1"
        activeOutlineColor="#2563EB"
      />
      <HelperText type="error" visible={Boolean(errors.estate)}>
        {errors.estate}
      </HelperText>
    </View>
  );

  const StepThree = (
    <View className="gap-3">
      <View className="items-center py-1">
        <Surface
          elevation={0}
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F5F3FF",
          }}
        >
          <MaterialCommunityIcons name="message-outline" size={30} color="#7C3AED" />
        </Surface>
        <Text className="mt-4 text-center text-[24px] font-bold text-slate-800">Reference Information</Text>
        <Text className="mt-1 text-center text-sm text-slate-500">How did you find us?</Text>
      </View>

      <Pressable onPress={() => setOpenPicker("heardAbout")}>
        <TextInput
          mode="outlined"
          label="How did you hear about us? *"
          value={heardAbout}
          placeholder="Select an option"
          editable={false}
          right={<TextInput.Icon icon="chevron-down" />}
          error={Boolean(errors.heardAbout)}
          outlineColor="#CBD5E1"
          activeOutlineColor="#2563EB"
        />
      </Pressable>
      <HelperText type="error" visible={Boolean(errors.heardAbout)}>
        {errors.heardAbout}
      </HelperText>

      {heardAbout === "Social Media" ? (
        <>
          <Pressable onPress={() => setOpenPicker("socialPlatform")}>
            <TextInput
              mode="outlined"
              label="Which platform did you see us on? *"
              value={socialPlatform}
              placeholder="Select platform"
              editable={false}
              right={<TextInput.Icon icon="chevron-down" />}
              error={Boolean(errors.socialPlatform)}
              outlineColor="#CBD5E1"
              activeOutlineColor="#2563EB"
            />
          </Pressable>
          <HelperText type="error" visible={Boolean(errors.socialPlatform)}>
            {errors.socialPlatform}
          </HelperText>

          {socialPlatform === "Other" ? (
            <>
              <TextInput
                mode="outlined"
                label="Please specify *"
                value={socialMediaOther}
                onChangeText={setSocialMediaOther}
                error={Boolean(errors.socialMediaOther)}
                outlineColor="#CBD5E1"
                activeOutlineColor="#2563EB"
              />
              <HelperText type="error" visible={Boolean(errors.socialMediaOther)}>
                {errors.socialMediaOther}
              </HelperText>
            </>
          ) : null}
        </>
      ) : null}

      {(heardAbout === "Direct Referral" || heardAbout === "Other") ? (
        <>
          <TextInput
            mode="outlined"
            label={heardAbout === "Direct Referral" ? "Who referred you? *" : "Please specify *"}
            value={referralDetail}
            onChangeText={setReferralDetail}
            error={Boolean(errors.referralDetail)}
            outlineColor="#CBD5E1"
            activeOutlineColor="#2563EB"
          />
          <HelperText type="error" visible={Boolean(errors.referralDetail)}>
            {errors.referralDetail}
          </HelperText>
        </>
      ) : null}

      {isCustomer ? (
        <>
          <Pressable onPress={() => setOpenPicker("serviceInterest")}>
            <TextInput
              mode="outlined"
              label="What services are you looking for? *"
              value={serviceInterest}
              placeholder="Select a service"
              editable={false}
              right={<TextInput.Icon icon="chevron-down" />}
              error={Boolean(errors.serviceInterest)}
              outlineColor="#CBD5E1"
              activeOutlineColor="#2563EB"
            />
          </Pressable>
          <HelperText type="error" visible={Boolean(errors.serviceInterest)}>
            {errors.serviceInterest}
          </HelperText>
        </>
      ) : null}
    </View>
  );

  const StepFour = (
    <View className="gap-3">
      <View className="items-center py-1">
        <Surface
          elevation={0}
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FEF3C7",
          }}
        >
          <MaterialCommunityIcons name="shield-check-outline" size={30} color="#D97706" />
        </Surface>
        <Text className="mt-4 text-center text-[24px] font-bold text-slate-800">Verify Your Email Address</Text>
        <Text className="mt-1 text-center text-sm text-slate-500">One last step to secure your account</Text>
      </View>

      <Card style={{ borderRadius: 16, borderWidth: 1, borderColor: "#DBEAFE", backgroundColor: "#EFF6FF" }}>
        <Card.Content>
          <Text className="text-center text-sm text-blue-700">
            Verify your email address to complete profile setup.
          </Text>
        </Card.Content>
      </Card>

      <TextInput
        mode="outlined"
        label="Email Address"
        value={email}
        editable={false}
        outlineColor="#CBD5E1"
        activeOutlineColor="#2563EB"
      />

      {!otpSent ? (
        <Button
          mode="contained"
          onPress={() => void handleSendOtp()}
          loading={isSendingOtp}
          disabled={isSendingOtp}
          buttonColor="#2563EB"
          contentStyle={{ height: 48 }}
          style={{ borderRadius: 12 }}
        >
          Send Verification Code
        </Button>
      ) : (
        <>
          <TextInput
            mode="outlined"
            label="Enter OTP"
            value={otpCode}
            onChangeText={(value) => setOtpCode(value.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            placeholder="000000"
            outlineColor="#CBD5E1"
            activeOutlineColor="#2563EB"
            error={Boolean(errors.otp)}
            right={isVerifyingOtp ? <TextInput.Icon icon={() => <ActivityIndicator size={16} />} /> : undefined}
          />
          <HelperText type="error" visible={Boolean(errors.otp)}>
            {errors.otp}
          </HelperText>

          {!canResend ? (
            <Text className="text-center text-sm text-slate-500">
              Resend code in {Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, "0")}
            </Text>
          ) : (
            <Button
              mode="outlined"
              onPress={() => void handleSendOtp()}
              textColor="#2563EB"
              style={{ borderColor: "#2563EB", borderRadius: 12 }}
              contentStyle={{ height: 48 }}
            >
              Resend Verification Code
            </Button>
          )}

          {otpVerified ? (
            <Text className="text-center text-sm font-medium text-green-700">Verified. Redirecting...</Text>
          ) : null}
        </>
      )}
    </View>
  );

  const renderStep = () => {
    if (step === 1) return StepOne;
    if (step === 2) return StepTwo;
    if (step === 3) return StepThree;
    if (step === 4) return StepFour;
    return StepOne;
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal}>
        <View className="flex-1 justify-end bg-slate-950/45 px-2 pb-2">
          <View className="h-[95%] rounded-[24px] bg-slate-100 p-4">
            <View className="mb-3 shrink-0 flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold text-slate-800">Complete Your Profile</Text>
                <Text className="mt-1 text-sm text-slate-500">
                  Step {step} of {totalSteps} • {stepTitle}
                </Text>
              </View>

              <Button
                mode="contained-tonal"
                icon="logout"
                onPress={closeModal}
                compact
                buttonColor="#E2E8F0"
                textColor="#334155"
                style={{ borderRadius: 12 }}
              >
                Log out
              </Button>
            </View>

            <View className="shrink-0">{StepIndicator}</View>

            <View className="shrink-0">
              <ProgressBar progress={progress} color="#2563EB" style={{ height: 6, borderRadius: 999 }} />
            </View>

            <View className="mt-4 flex-1">
              <ScrollView
                style={{ flex: 1 }}
                contentContainerClassName="pb-2"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Card style={{ borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
                  <Card.Content style={{ paddingVertical: 20 }}>{renderStep()}</Card.Content>
                </Card>
              </ScrollView>
            </View>

            <View className="mt-4 shrink-0 flex-row gap-3">
              <Button
                mode="outlined"
                onPress={handleBack}
                textColor="#334155"
                style={{ flex: 1, borderRadius: 12, borderColor: "#CBD5E1" }}
                contentStyle={{ height: 48 }}
              >
                Back
              </Button>

              {step < 4 ? (
                <Button
                  mode="contained"
                  onPress={handleContinue}
                  buttonColor="#2563EB"
                  textColor="#FFFFFF"
                  style={{ flex: 1, borderRadius: 12 }}
                  contentStyle={{ height: 48 }}
                >
                  Continue
                </Button>
              ) : (
                <View className="flex-1 items-center justify-center rounded-xl border border-green-200 bg-green-50 px-3">
                  <Text className="text-sm font-medium text-green-700">
                    {isVerifyingOtp ? "Verifying and redirecting..." : otpVerified ? "Verified. Redirecting..." : "Enter OTP to continue"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {pickerConfig ? (
        <OptionPickerModal
          visible={openPicker !== null}
          title={pickerConfig.title}
          options={pickerConfig.options}
          multiSelect={openPicker === "contractorType" || openPicker === "hardwareGroup"}
          selectedOptions={
            openPicker === "contractorType"
              ? contractorTypes
              : openPicker === "hardwareGroup"
                ? hardwareGroups
                : []
          }
          onClose={() => setOpenPicker(null)}
          onDone={() => setOpenPicker(null)}
          onSelect={pickerConfig.onSelect}
          onToggleOption={
            openPicker === "contractorType"
              ? toggleContractorType
              : openPicker === "hardwareGroup"
                ? toggleHardwareGroup
                : undefined
          }
        />
      ) : null}
    </>
  );
};

export default ProfileCompletion;
