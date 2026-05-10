import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { FUNDI_SKILL_OPTIONS, ACCOUNT_TYPE_OPTIONS } from "../../../shared/constants/skill";
import { OptionPickerModal } from "../../../shared/components";

const RoleSelection = () => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);

  const handleContinue = () => {
    if (!selectedType) {
      return;
    }

    if (selectedType === "Fundi" && !selectedSkill) {
      return;
    }

    router.replace({
      pathname: "/",
      params: {
        completeProfile: "1",
        userType: selectedType,
        skill: selectedSkill,
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
                      onPress={() => {
                        setSelectedType(option);
                        if (option !== "Fundi") {
                          setSelectedSkill("");
                        }
                      }}
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

              {selectedType === "Fundi" ? (
                <View className="mt-6">
                  <Text className="mb-3 text-[15px] font-medium text-slate-800">
                    Select your skill
                  </Text>
                  <Pressable
                    className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
                      selectedSkill ? "border-violet-600 bg-violet-50" : "border-slate-300 bg-white"
                    }`}
                    onPress={() => setSkillPickerOpen(true)}
                  >
                    <Text className={`${selectedSkill ? "text-slate-900" : "text-slate-400"} text-base`}>
                      {selectedSkill || "Choose your skill"}
                    </Text>
                    <Feather name="chevron-down" size={22} color="#94A3B8" />
                  </Pressable>
                </View>
              ) : null}

              <Pressable
                className={`mt-8 items-center justify-center rounded-2xl px-4 py-4 ${
                  selectedType && (selectedType !== "Fundi" || selectedSkill)
                    ? "bg-violet-600"
                    : "bg-violet-300"
                }`}
                onPress={handleContinue}
                disabled={!selectedType || (selectedType === "Fundi" && !selectedSkill)}
              >
                <Text className="text-base font-semibold text-white">Continue</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <OptionPickerModal
        visible={skillPickerOpen}
        title="Select your skill"
        options={FUNDI_SKILL_OPTIONS}
        onClose={() => setSkillPickerOpen(false)}
        onSelect={(value) => {
          setSelectedSkill(value);
          setSkillPickerOpen(false);
        }}
      />
    </>
  );
};

export default RoleSelection;
