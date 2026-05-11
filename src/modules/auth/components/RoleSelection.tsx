import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ACCOUNT_TYPE_OPTIONS } from "../../../shared/constants/skill";

const RoleSelection = () => {
  const [selectedType, setSelectedType] = useState("");

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    router.replace({
      pathname: "/",
      params: {
        completeProfile: "1",
        userType: type,
      },
    });
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-slate-50">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-5 py-8"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            className="mb-8 flex-row items-center gap-3 self-start rounded-full px-2 py-2 active:bg-slate-100"
            onPress={() => router.replace("/signin")}
          >
            <Feather name="arrow-left" size={20} color="#334155" />
            <Text className="text-base font-medium text-slate-600">Back to Sign In</Text>
          </Pressable>

          <View className="flex-1 justify-center">
            <View className="rounded-[32px] border border-slate-200 bg-white px-6 py-8">
              <View className="items-center">
                <Image
                  source={require("../../../../assets/jagedo-logo.webp")}
                  resizeMode="contain"
                  className="h-14 w-40"
                />
                <Text className="mt-5 text-[30px] font-bold text-slate-950">
                  Select Account Type
                </Text>
                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                  Choose a testing profile path to preview the dynamic profile completion flow.
                </Text>
              </View>

              <View className="mt-8 gap-3">
                {ACCOUNT_TYPE_OPTIONS.map((option) => {
                  const isSelected = selectedType === option;

                  return (
                    <Pressable
                      key={option}
                      className={`rounded-2xl border px-4 py-4 ${
                        isSelected
                          ? "border-violet-600 bg-violet-50"
                          : "border-slate-200 bg-white"
                      }`}
                      onPress={() => handleSelectType(option)}
                    >
                      <Text
                        className={`text-base font-semibold ${
                          isSelected ? "text-violet-700" : "text-slate-800"
                        }`}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text className="mt-8 text-center text-sm leading-6 text-slate-500">
                Selecting an account type takes you straight into the profile completion flow.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default RoleSelection;
