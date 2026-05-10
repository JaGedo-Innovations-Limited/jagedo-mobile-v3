import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type ProfileCompletionTextFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
  secureTextEntry?: boolean;
  error?: string;
};

export const ProfileCompletionTextField = ({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = "default",
  secureTextEntry,
  error,
}: ProfileCompletionTextFieldProps) => {
  return (
    <View className="mb-5">
      <Text className="mb-3 text-[15px] font-medium text-slate-800">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        className={`rounded-2xl border bg-white px-4 py-4 text-[16px] text-slate-950 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
      />
      {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
};

type ProfileCompletionSelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  error?: string;
};

export const ProfileCompletionSelectField = ({
  label,
  value,
  placeholder,
  onPress,
  error,
}: ProfileCompletionSelectFieldProps) => {
  return (
    <View className="mb-5">
      <Text className="mb-3 text-[15px] font-medium text-slate-800">{label}</Text>
      <Pressable
        className={`flex-row items-center justify-between rounded-2xl border bg-white px-4 py-4 ${
          error ? "border-red-400" : "border-slate-300"
        }`}
        onPress={onPress}
      >
        <Text className={`text-[16px] ${value ? "text-slate-900" : "text-slate-400"}`}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={22} color="#94A3B8" />
      </Pressable>
      {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
    </View>
  );
};
