import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CompleteProfileModal } from "../src/shared/components";

export default function HomeScreen() {
  const params = useLocalSearchParams<{
    completeProfile?: string;
    userType?: string;
    skill?: string;
  }>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [profileFlowOpen, setProfileFlowOpen] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    const userTypeParam = Array.isArray(params.userType) ? params.userType[0] : params.userType;
    const skillParam = Array.isArray(params.skill) ? params.skill[0] : params.skill;
    const shouldOpen = Array.isArray(params.completeProfile)
      ? params.completeProfile[0] === "1"
      : params.completeProfile === "1";

    if (userTypeParam) {
      setSelectedUserType(userTypeParam);
    }

    if (skillParam) {
      setSelectedSkill(skillParam);
    }

    if (shouldOpen) {
      setProfileFlowOpen(true);
    }
  }, [params.completeProfile, params.skill, params.userType]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1">
        <View className="border-b border-slate-200 bg-white px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-full active:bg-slate-100"
                onPress={() => setDrawerOpen(true)}
              >
                <Feather name="menu" size={22} color="#111827" />
              </Pressable>
              <Text className="text-[18px] font-bold text-slate-950">Home</Text>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="relative">
                <Pressable className="h-10 w-10 items-center justify-center rounded-full active:bg-slate-100">
                  <Feather name="bell" size={20} color="#111827" />
                </Pressable>
                <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
              </View>

              <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:opacity-80">
                <Text className="text-base font-semibold text-slate-700">U</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="rounded-[28px] border border-slate-200 bg-white p-5">
            <Text className="text-[30px] font-bold text-slate-950">Welcome back</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">
              Your JaGedo dashboard helps you complete your profile, manage updates, and stay
              on top of customer activity.
            </Text>

            <View className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
              <Text className="text-2xl font-bold text-slate-950">Complete Your Profile</Text>
              <Text className="mt-3 text-sm leading-6 text-slate-500">
                Help us serve you better by completing your profile. Add your personal
                information, location details, and preferences to get started.
              </Text>

              <Pressable
                className="mt-5 self-start rounded-2xl bg-violet-600 px-5 py-3 active:opacity-90"
                onPress={() => {
                  if (!selectedUserType || (selectedUserType === "Fundi" && !selectedSkill)) {
                    router.push("/role-selection");
                    return;
                  }

                  setProfileFlowOpen(true);
                }}
              >
                <Text className="text-base font-semibold text-white">Complete profile</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <View className="border-t border-slate-200 px-5 py-4">
          <Text className="text-center text-sm text-slate-500">
            (c) 2026 JaGedo. All rights reserved.
          </Text>
        </View>

        {drawerOpen ? (
          <View className="absolute inset-0 flex-row">
            <Pressable className="w-[78%] max-w-[320px] bg-white pt-4" onPress={() => {}}>
              <View className="flex-row items-center justify-between px-4 pb-6">
                <Image
                  source={require("../assets/jagedo-logo.webp")}
                  resizeMode="contain"
                  className="h-10 w-28"
                />

                <Pressable
                  className="h-10 w-10 items-center justify-center rounded-full active:bg-slate-100"
                  onPress={closeDrawer}
                >
                  <Feather name="x" size={22} color="#334155" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="px-6 pb-8">
                  <Text className="mb-4 text-xs font-semibold uppercase tracking-[1.4px] text-slate-400">
                    Overview
                  </Text>

                  <Pressable className="mb-6 flex-row items-center gap-4 rounded-r-2xl border-l-2 border-violet-600 bg-violet-50 px-3 py-4 active:opacity-90">
                    <Feather name="home" size={21} color="#4F46E5" />
                    <Text className="text-[17px] font-semibold text-violet-600">Home</Text>
                  </Pressable>

                  <Text className="mb-4 text-xs font-semibold uppercase tracking-[1.4px] text-slate-400">
                    Management
                  </Text>

                  <Pressable
                    className="flex-row items-center justify-between rounded-2xl px-3 py-4 active:bg-slate-50"
                    onPress={() => setSettingsOpen((current) => !current)}
                  >
                    <View className="flex-row items-center gap-4">
                      <Ionicons name="settings-outline" size={22} color="#94A3B8" />
                      <Text className="text-[17px] font-medium text-slate-900">Settings</Text>
                    </View>
                    <Feather
                      name={settingsOpen ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#94A3B8"
                    />
                  </Pressable>

                  {settingsOpen ? (
                    <View className="ml-5 mt-2 gap-1 border-l border-slate-200 pl-5">
                      <Pressable
                        className="flex-row items-center gap-4 rounded-2xl px-3 py-3 active:bg-slate-50"
                        onPress={() => {
                          closeDrawer();
                          router.push("/profile");
                        }}
                      >
                        <Feather name="user" size={20} color="#94A3B8" />
                        <Text className="text-base text-slate-500">Profile</Text>
                      </Pressable>

                      <Pressable className="flex-row items-center gap-4 rounded-2xl px-3 py-3 active:bg-slate-50">
                        <Feather name="bell" size={20} color="#94A3B8" />
                        <Text className="text-base text-slate-500">Notification</Text>
                      </Pressable>
                    </View>
                  ) : null}

                  <Pressable
                    className="mt-6 flex-row items-center gap-4 rounded-2xl px-3 py-4 active:bg-slate-50"
                    onPress={() => {
                      closeDrawer();
                      router.replace("/signin");
                    }}
                  >
                    <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
                    <Text className="text-[17px] font-medium text-red-500">Logout</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </Pressable>

            <Pressable className="flex-1 bg-slate-900/55" onPress={closeDrawer} />
          </View>
        ) : null}

        <CompleteProfileModal
          visible={profileFlowOpen}
          onClose={() => setProfileFlowOpen(false)}
          userType={selectedUserType}
          selectedSkill={selectedSkill}
        />
      </View>
    </SafeAreaView>
  );
}
