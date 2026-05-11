import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";

import {
  getProfileData,
  getSignupData,
  getUploadsData,
  type SavedProfileData,
  type SavedSignupData,
  type SavedUploadsData,
} from "../../src/shared/utils/profileStorage";

type ActivityParams = {
  userType?: string | string[];
  accountType?: string | string[];
  email?: string | string[];
  phone?: string | string[];
  contractorType?: string | string[];
  firstName?: string | string[];
  lastName?: string | string[];
};

type ActivityEvent = {
  id: string;
  action: string;
  description: string;
  user: string;
  role: string;
  timeMs: number;
};

const pickFirst = (value?: string | string[]) => (Array.isArray(value) ? value[0] || "" : value || "");

const toTimestamp = (value?: string) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatRole = (value: string) => {
  const upper = value.toUpperCase();
  if (upper === "CUSTOMER") return "CUSTOMER";
  if (upper === "FUNDI") return "FUNDI";
  if (upper === "PROFESSIONAL") return "PROFESSIONAL";
  if (upper === "CONTRACTOR") return "CONTRACTOR";
  if (upper === "HARDWARE") return "HARDWARE";
  return upper || "USER";
};

const formatDocumentKey = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const formatEventTime = (timeMs: number) => {
  if (!Number.isFinite(timeMs) || timeMs <= 0) return "N/A";
  return new Date(timeMs).toLocaleString();
};

const ActivityScreen = () => {
  const params = useLocalSearchParams<ActivityParams>();
  const [savedProfile, setSavedProfile] = useState<SavedProfileData | null>(null);
  const [savedSignup, setSavedSignup] = useState<SavedSignupData | null>(null);
  const [savedUploads, setSavedUploads] = useState<SavedUploadsData | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

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
  const firstName = pickFirst(params.firstName) || savedProfile?.firstName || "";
  const lastName = pickFirst(params.lastName) || savedProfile?.lastName || "";

  const profileKey = useMemo(() => `${userType}|${email}|${phone}`.trim() || "USER|unknown", [email, phone, userType]);

  useEffect(() => {
    let mounted = true;
    const loadUploads = async () => {
      const uploads = await getUploadsData(profileKey);
      if (!mounted) return;
      setSavedUploads(uploads);
    };
    void loadUploads();
    return () => {
      mounted = false;
    };
  }, [profileKey]);

  const userDisplay = useMemo(() => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (email) return email;
    if (phone) return phone;
    if (fullName) return fullName;
    return "N/A";
  }, [email, firstName, lastName, phone]);

  const events = useMemo(() => {
    const role = formatRole(userType);
    const now = Date.now();
    let fallbackTime = now;
    const nextFallbackTime = () => {
      fallbackTime -= 1000;
      return fallbackTime;
    };
    const collected: ActivityEvent[] = [];

    if (savedSignup || userType) {
      collected.push({
        id: "signed-up",
        action: "Signed up",
        description: "Account registration details were captured.",
        user: userDisplay,
        role,
        timeMs: nextFallbackTime(),
      });
    }

    const hasCoreProfile = Boolean(firstName.trim() && lastName.trim() && email.trim() && phone.trim());
    if (hasCoreProfile) {
      const accountHint = accountType ? ` (${accountType})` : "";
      collected.push({
        id: "completed-profile",
        action: "Completed profile",
        description: `Profile details were completed${accountHint}.`,
        user: userDisplay,
        role,
        timeMs: nextFallbackTime(),
      });
    }

    const docs = savedUploads?.documents || {};
    Object.entries(docs).forEach(([docKey, document]) => {
      const statusLabel = document?.status ? ` Status: ${document.status}.` : "";
      collected.push({
        id: `doc-${docKey}`,
        action: `Uploaded ${formatDocumentKey(docKey)}`,
        description: `Document uploaded.${statusLabel}`.trim(),
        user: userDisplay,
        role,
        timeMs: toTimestamp(document?.uploadedAt) ?? nextFallbackTime(),
      });
    });

    const categoryDocs = savedUploads?.categoryDocs || {};
    Object.entries(categoryDocs).forEach(([category, bundle]) => {
      Object.entries(bundle || {}).forEach(([docKey, document]) => {
        const statusLabel = document?.status ? ` Status: ${document.status}.` : "";
        collected.push({
          id: `cat-${category}-${docKey}`,
          action: `Uploaded ${formatDocumentKey(docKey)}`,
          description: `${category} category document uploaded.${statusLabel}`.trim(),
          user: userDisplay,
          role,
          timeMs: toTimestamp(document?.uploadedAt) ?? nextFallbackTime(),
        });
      });
    });

    if (savedUploads?.submissionStatus === "submitted") {
      collected.push({
        id: "submitted-for-verification",
        action: "Submitted for verification",
        description:
          contractorType.trim().length > 0
            ? `Uploads were submitted for review (${contractorType}).`
            : "Uploads were submitted for review.",
        user: userDisplay,
        role,
        timeMs: toTimestamp(savedUploads.submittedAt) ?? nextFallbackTime(),
      });
    }

    return collected.sort((a, b) => b.timeMs - a.timeMs);
  }, [
    accountType,
    contractorType,
    email,
    firstName,
    lastName,
    phone,
    savedSignup,
    savedUploads,
    userDisplay,
    userType,
  ]);

  const filteredEvents = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return events;
    return events.filter((event) =>
      [event.action, event.description, event.user, event.role].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [events, searchValue]);

  const visibleEvents = useMemo(() => filteredEvents.slice(0, visibleCount), [filteredEvents, visibleCount]);

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

          <Pressable
            className="rounded-full bg-slate-900 px-4 py-2.5 active:opacity-80"
            onPress={() => router.replace("/signin")}
          >
            <Text className="text-sm font-semibold text-white">Logout</Text>
          </Pressable>
        </View>

        <View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
          <Text className="text-lg font-bold text-slate-900">Recent Activities / Logs</Text>
          <Text className="mt-1 text-xs text-slate-500">
            Profile-level activity logs for customer, fundi, professional, contractor, and hardware users.
          </Text>

          <View className="mt-4 flex-row items-center gap-2">
            <TextInput
              className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
              placeholder="Search logs..."
              placeholderTextColor="#94A3B8"
              value={searchValue}
              onChangeText={setSearchValue}
            />
            <Pressable
              className="h-10 min-w-[56px] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 active:opacity-80"
              onPress={() => {
                setVisibleCount((current) => (current === 10 ? 20 : current === 20 ? 50 : 10));
              }}
            >
              <Text className="text-xs font-semibold text-slate-700">{visibleCount}</Text>
            </Pressable>
          </View>

          <View className="mt-4 rounded-xl border border-slate-200">
            <View className="flex-row border-b border-slate-200 bg-slate-100 px-3 py-2">
              <Text className="w-[42%] text-[10px] font-semibold uppercase tracking-[1px] text-slate-500">Action</Text>
              <Text className="w-[20%] text-[10px] font-semibold uppercase tracking-[1px] text-slate-500">User</Text>
              <Text className="w-[18%] text-[10px] font-semibold uppercase tracking-[1px] text-slate-500">Role</Text>
              <Text className="w-[20%] text-[10px] font-semibold uppercase tracking-[1px] text-slate-500">Time</Text>
            </View>

            {visibleEvents.length ? (
              visibleEvents.map((event) => (
                <View key={event.id} className="flex-row border-b border-slate-100 px-3 py-3">
                  <View className="w-[42%] pr-2">
                    <Text className="text-sm font-semibold text-blue-700">{event.action}</Text>
                    <Text className="mt-1 text-xs text-slate-500">{event.description}</Text>
                  </View>
                  <Text className="w-[20%] pr-2 text-xs text-slate-700">{event.user}</Text>
                  <Text className="w-[18%] pr-2 text-xs font-semibold text-slate-700">{event.role}</Text>
                  <Text className="w-[20%] text-xs text-slate-600">{formatEventTime(event.timeMs)}</Text>
                </View>
              ))
            ) : (
              <View className="px-3 py-5">
                <Text className="text-xs text-slate-500">No activity logs found.</Text>
              </View>
            )}
          </View>

          <Text className="mt-3 text-xs text-slate-500">
            Showing {visibleEvents.length} of {filteredEvents.length} log entries.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivityScreen;
