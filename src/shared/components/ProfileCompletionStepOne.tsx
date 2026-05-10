import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ProfileCompletionTextField } from "./ProfileCompletionField";

type ProfileCompletionStepOneProps = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setEmailAddress: (value: string) => void;
  errors: Record<string, string>;
};

const ProfileCompletionStepOne = ({
  firstName,
  lastName,
  phoneNumber,
  emailAddress,
  setFirstName,
  setLastName,
  setPhoneNumber,
  setEmailAddress,
  errors,
}: ProfileCompletionStepOneProps) => {
  return (
    <View>
      <View className="mb-6 flex-row items-center gap-4">
        <View className="h-28 w-28 items-center justify-center rounded-[24px] bg-slate-100">
          <Feather name="user" size={46} color="#94A3B8" />
        </View>

        <View className="flex-1">
          <Pressable className="self-start rounded-2xl border border-slate-300 bg-white px-4 py-3 active:opacity-90">
            <Text className="text-base font-medium text-slate-700">Change avatar</Text>
          </Pressable>
          <Text className="mt-3 text-sm text-slate-400">JPG, GIF or PNG. 1MB max.</Text>
        </View>
      </View>

      <ProfileCompletionTextField
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        error={errors.firstName}
      />
      <ProfileCompletionTextField
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        error={errors.lastName}
      />
      <ProfileCompletionTextField
        label="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        error={errors.phoneNumber}
      />
      <ProfileCompletionTextField
        label="Email address"
        value={emailAddress}
        onChangeText={setEmailAddress}
        keyboardType="email-address"
        error={errors.emailAddress}
      />
    </View>
  );
};

export default ProfileCompletionStepOne;
