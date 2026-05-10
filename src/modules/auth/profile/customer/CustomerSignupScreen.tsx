import { useEffect, useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { AccountTypeDropdown } from "../components/AccountTypeDropdown";
import { BackArrow } from "../components/BackArrow";
import {
  CUSTOMER_ACCOUNT_TYPE_DESCRIPTIONS,
  CUSTOMER_ACCOUNT_TYPES,
  type CustomerAccountType,
  SIGNUP_USER_TYPE_OPTIONS,
  type SignupUserType,
} from "./customerSignup.data";

export function CustomerSignupScreen() {
  const isWeb = Platform.OS === "web";
  const webFontFamily = "Segoe UI, Arial, sans-serif";
  const [userType, setUserType] = useState<SignupUserType | null>(null);
  const [customerAccountType, setCustomerAccountType] =
    useState<CustomerAccountType | null>(null);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showVerifiedPopup, setShowVerifiedPopup] = useState(false);

  const isCustomer = userType === "CUSTOMER";
  const isBuilderType =
    userType === "FUNDI" ||
    userType === "PROFESSIONAL" ||
    userType === "CONTRACTOR" ||
    userType === "HARDWARE";

  const customerDescription = useMemo(() => {
    if (!customerAccountType) return "";
    return CUSTOMER_ACCOUNT_TYPE_DESCRIPTIONS[customerAccountType];
  }, [customerAccountType]);

  const trimmedContact = emailOrPhone.trim();
  const normalizedPhone = trimmedContact.replace(/[\s()-]/g, "");
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(trimmedContact);
  const isValidPhone = /^\+?\d{10,15}$/.test(normalizedPhone);
  const hasValidContact = isValidEmail || isValidPhone;
  const showContactError = trimmedContact.length > 0 && !hasValidContact;
  const isUserTypeReady = !!userType;
  const isCustomerTypeReady = !isCustomer || !!customerAccountType;
  const isAccountReady = isUserTypeReady && isCustomerTypeReady;
  const canGetCode = isAccountReady && hasValidContact;
  const normalizedCode = verificationCode.replace(/\D/g, "");
  const isValidCode = /^\d{6}$/.test(normalizedCode);
  const canSignUp =
    isAccountReady && hasValidContact && verificationRequested && otpVerified;

  useEffect(() => {
    if (!showVerifiedPopup) return;
    const timeoutId = setTimeout(() => setShowVerifiedPopup(false), 2500);
    return () => clearTimeout(timeoutId);
  }, [showVerifiedPopup]);

  useEffect(() => {
    if (!verificationRequested) {
      setOtpVerified(false);
      return;
    }

    if (isValidCode && !otpVerified) {
      setOtpVerified(true);
      setShowVerifiedPopup(true);
      return;
    }

    if (!isValidCode && otpVerified) {
      setOtpVerified(false);
    }
  }, [isValidCode, otpVerified, verificationRequested]);

  return (
    <View className="flex-1 bg-[#f2f4f8]">
      {showVerifiedPopup ? (
        <View className="absolute left-0 right-0 top-5 z-50 items-center px-4">
          <View className="w-full max-w-[380px] flex-row items-center rounded-xl border border-[#a7e0bf] bg-[#dff7e8] px-4 py-3 shadow-sm">
            <MaterialCommunityIcons color="#16a34a" name="check-circle" size={18} />
            <Text className="ml-2 text-[17px] font-semibold text-[#178a45]">
              OTP verified successfully!
            </Text>
          </View>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          bounces={false}
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 16,
            paddingTop: 32,
            paddingBottom: 28,
          }}
        >
          <View className="w-full max-w-[450px]">
            <BackArrow />
            <View className="w-full rounded-2xl border border-[#e4e7ed] bg-white px-8 py-8">
              <View className="mb-6 items-center">
                <Image
                  resizeMode="contain"
                  source={require("../../../../../assets/jagedo-logo.png")}
                  style={{
                    width: isWeb ? 210 : 170,
                    height: isWeb ? 72 : 52,
                  }}
                />
              </View>

              <Text
                className="mb-2 text-center font-bold text-[#111827]"
                style={{
                  fontSize: isWeb ? 50 : 34,
                  fontFamily: isWeb ? webFontFamily : undefined,
                }}
              >
                Create your account
              </Text>

              <Text
                className="mb-5 text-center text-[16px] text-[#7c8595]"
                style={{ fontFamily: isWeb ? webFontFamily : undefined }}
              >
                Enter your phone number or email to receive OTP
              </Text>

              <AccountTypeDropdown
                label="Account Type"
                onChange={(nextUserType) => {
                  setUserType(nextUserType);
                  if (nextUserType !== "CUSTOMER") {
                    setCustomerAccountType(null);
                  }
                  setVerificationRequested(false);
                  setOtpVerified(false);
                  setVerificationCode("");
                  setShowVerifiedPopup(false);
                }}
                options={SIGNUP_USER_TYPE_OPTIONS}
                placeholder="Select account type"
                value={userType}
              />

              {isCustomer ? (
                <View className="mt-5">
                  <Text className="mb-2 text-[15px] font-bold text-[#1f2937]">
                    Customer Type
                  </Text>

                  <View className="flex-row gap-3">
                    {CUSTOMER_ACCOUNT_TYPES.map((accountType) => {
                      const isSelected = customerAccountType === accountType.value;
                      return (
                        <Pressable
                          className={`h-11 flex-1 items-center justify-center rounded-xl ${
                            isSelected ? "bg-[#0b0f9f]" : "bg-[#d2d6de]"
                          }`}
                          key={accountType.value}
                          onPress={() => setCustomerAccountType(accountType.value)}
                        >
                          <Text
                            className={`text-[16px] font-medium ${
                              isSelected ? "text-white" : "text-[#4b5563]"
                            }`}
                            style={{ fontFamily: isWeb ? webFontFamily : undefined }}
                          >
                            {accountType.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {customerAccountType ? (
                    <View className="mt-4 rounded-xl bg-[#eceef2] px-4 py-3">
                      <Text className="text-center text-[14px] leading-6 text-[#334155]">
                        {customerDescription}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : isBuilderType ? (
                <View className="mt-5 rounded-xl bg-[#eceef2] px-4 py-3">
                  <Text className="text-center text-[14px] leading-6 text-[#334155]">
                    Continue as {userType?.toLowerCase()} and request a 6-digit code to
                    complete signup.
                  </Text>
                </View>
              ) : null}

              <View className="mt-5">
                <Text className="mb-2 text-[15px] font-bold text-[#1f2937]">
                  Email or Phone Number
                </Text>

                <View className="flex-row items-center gap-2">
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="h-12 flex-1 rounded-xl border border-[#c8ced8] bg-white px-4 text-[17px] text-[#111827]"
                    keyboardType="email-address"
                    onChangeText={setEmailOrPhone}
                    placeholder=""
                    placeholderTextColor="#ffffff"
                    value={emailOrPhone}
                    style={{ fontFamily: isWeb ? webFontFamily : undefined }}
                  />

                  <Pressable
                    className={`h-12 min-w-[102px] items-center justify-center rounded-xl ${
                      canGetCode ? "bg-[#16a34a]" : "bg-[#d1d5db]"
                    }`}
                    disabled={!canGetCode}
                    onPress={() => {
                      setVerificationRequested(true);
                      setOtpVerified(false);
                      setVerificationCode("");
                      setShowVerifiedPopup(false);
                    }}
                  >
                    <Text className="text-[17px] font-bold text-white">Get Code</Text>
                  </Pressable>
                </View>

                {showContactError ? (
                  <Text className="mt-2 text-[13px] text-[#dc2626]">
                    Enter a valid email or phone number (10 to 15 digits).
                  </Text>
                ) : null}
              </View>

              {verificationRequested ? (
                <View className="mt-4">
                  <Text className="mb-2 text-[15px] font-bold text-[#1f2937]">
                    Verification Code
                  </Text>
                  <TextInput
                    className="h-12 rounded-xl border border-[#c8ced8] bg-white px-4 text-[17px] text-[#111827]"
                    keyboardType="number-pad"
                    maxLength={6}
                    onChangeText={(value) => {
                      setVerificationCode(value.replace(/\D/g, "").slice(0, 6));
                    }}
                    placeholder=""
                    placeholderTextColor="#ffffff"
                    value={verificationCode}
                  />
                  {verificationCode.length > 0 && !isValidCode ? (
                    <Text className="mt-2 text-[13px] text-[#dc2626]">
                      Enter any 6-digit code.
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <Pressable
                className={`mt-4 h-12 items-center justify-center rounded-xl ${
                  canSignUp ? "bg-[#16a34a]" : "bg-[#bcc1ca]"
                }`}
                disabled={!canSignUp}
                onPress={() => {
                  // Next step: API signup call after verified OTP.
                }}
              >
                <Text className="text-[17px] font-bold text-white">Sign Up</Text>
              </Pressable>

              <View className="mt-5 flex-row items-center">
                <View className="h-px flex-1 bg-[#d7dbe3]" />
                <Text className="mx-3 text-[16px] text-[#6b7280]">or</Text>
                <View className="h-px flex-1 bg-[#d7dbe3]" />
              </View>

              <Pressable className="mt-5 h-12 flex-row items-center justify-center rounded-xl border border-[#c8ced8] bg-white">
                <Text className="mr-2 text-[24px] font-bold text-[#4285F4]">G</Text>
                <Text className="text-[17px] font-medium text-[#111827]">
                  Sign up with Google
                </Text>
              </Pressable>

              <View className="mt-5 flex-row items-center justify-center">
                <Text className="text-[15px] text-[#7c8595]">Already have an account? </Text>
                <Pressable>
                  <Text className="text-[15px] font-medium text-[#2563eb]">Sign in</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
