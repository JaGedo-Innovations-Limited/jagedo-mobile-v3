import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  // AccountInfo,
  // Address,
  Experience,
} from "../../src/modules/profileManagement/components";

const ProfileScreen = () => {
  const params = useLocalSearchParams<{ userType?: string }>();
  const userTypeParam = Array.isArray(params.userType) ? params.userType[0] : params.userType;
  const userType = userTypeParam || "Fundi";
  const welcomeName = userType === "Hardware" ? "Hardware" : userType;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-white active:opacity-80"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#0F172A" />
          </Pressable>

          <Pressable
            className="rounded-full bg-slate-900 px-4 py-2.5 active:opacity-80"
            onPress={() => router.replace("/signin")}
          >
            <Text className="text-sm font-semibold text-white">Logout</Text>
          </Pressable>
        </View>

        <View className="mb-5 rounded-[28px] bg-[#0F172A] p-5">
          <Text className="text-sm font-medium uppercase tracking-[1.5px] text-sky-200">
            Profile Management
          </Text>
          <Text className="mt-3 text-3xl font-bold text-white">Welcome, {welcomeName}!</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-300">
            Review your account details and service location from one clean mobile view.
          </Text>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <View className="rounded-full bg-white/10 px-4 py-2">
              <Text className="text-sm font-medium text-white">Account Verified</Text>
            </View>
            <View className="rounded-full bg-emerald-500/20 px-4 py-2">
              <Text className="text-sm font-medium text-emerald-300">Address Complete</Text>
            </View>
          </View>
        </View>

        <View className="mb-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-blue-600 px-4 py-3">
            <Text className="text-sm font-semibold text-white">Account Info</Text>
            <Text className="mt-1 text-xs text-blue-100">Personal details</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-white px-4 py-3 border border-slate-200">
            <Text className="text-sm font-semibold text-slate-900">Address</Text>
            <Text className="mt-1 text-xs text-slate-500">Location details</Text>
          </View>
        </View>

        <View className="gap-5">
          {/* <AccountInfo /> */}
          {/* <Address /> */}
          <Experience userType={userType} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
