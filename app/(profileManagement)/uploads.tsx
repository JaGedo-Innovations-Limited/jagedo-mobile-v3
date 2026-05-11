import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

import UploadsPanel from "../../src/modules/profileManagement/components/UploadsPanel";
import {
  getProfileData,
  getSignupData,
  type SavedProfileData,
  type SavedSignupData,
} from "../../src/shared/utils/profileStorage";

type UploadParams = {
  userType?: string | string[];
  accountType?: string | string[];
  email?: string | string[];
  phone?: string | string[];
  contractorType?: string | string[];
};

const pickFirst = (value?: string | string[]) => (Array.isArray(value) ? value[0] || "" : value || "");

const UploadsScreen = () => {
  const params = useLocalSearchParams<UploadParams>();
  const [savedProfile, setSavedProfile] = useState<SavedProfileData | null>(null);
  const [savedSignup, setSavedSignup] = useState<SavedSignupData | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      const [profileData, signupData] = await Promise.all([getProfileData(), getSignupData()]);
      if (!mounted) return;
      setSavedProfile(profileData);
      setSavedSignup(signupData);
    };
    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const userType = pickFirst(params.userType) || savedProfile?.userType || savedSignup?.userType || "";
  const accountType = pickFirst(params.accountType) || savedProfile?.accountType || "";
  const email = pickFirst(params.email) || savedProfile?.email || "";
  const phone = pickFirst(params.phone) || savedProfile?.phone || "";
  const contractorType = pickFirst(params.contractorType) || savedProfile?.contractorType || "";

  const profileKey = useMemo(() => `${userType}|${email}|${phone}`.trim() || "USER|unknown", [email, phone, userType]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-10 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full bg-white active:opacity-80"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#0F172A" />
          </Pressable>

          <View className={`rounded-full px-3 py-2 ${isComplete ? "bg-emerald-100" : "bg-amber-100"}`}>
            <Text className={`text-xs font-semibold ${isComplete ? "text-emerald-700" : "text-amber-700"}`}>
              {isComplete ? "Uploads Complete" : "Uploads Incomplete"}
            </Text>
          </View>
        </View>

        <View className="mb-4 rounded-2xl bg-[#0F172A] px-4 py-4">
          <Text className="text-lg font-semibold text-white">Uploads</Text>
          <Text className="mt-1 text-xs text-slate-300">
            Shared uploads view for customer, fundi, professional, contractor, and hardware.
          </Text>
        </View>

        <UploadsPanel
          accountType={accountType}
          contractorType={contractorType}
          profileKey={profileKey}
          userType={userType}
          onCompletionChange={setIsComplete}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UploadsScreen;
