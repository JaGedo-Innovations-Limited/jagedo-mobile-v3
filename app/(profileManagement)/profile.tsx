import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
import UploadsPanel from "../../src/modules/profileManagement/components/UploadsPanel";

type ActiveSection = "account" | "address" | "uploads";

type ProfileParams = {
  userType?: string | string[];
  accountType?: string | string[];
  firstName?: string | string[];
  lastName?: string | string[];
  email?: string | string[];
  phone?: string | string[];
  fundiSkill?: string | string[];
  profession?: string | string[];
  contractorType?: string | string[];
  hardwareGroup?: string | string[];
  county?: string | string[];
  subCounty?: string | string[];
  town?: string | string[];
  estate?: string | string[];
  heardAbout?: string | string[];
  referralDetail?: string | string[];
  socialPlatform?: string | string[];
  socialMediaOther?: string | string[];
  serviceInterest?: string | string[];
};

type InfoRow = {
  label: string;
  value: string;
};

const pickFirst = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

const preferValue = (primary: string, fallback: string) => primary || fallback;

const formatUserType = (value: string) => {
  if (!value) return "User";
  const upper = value.toUpperCase();
  if (upper === "CUSTOMER") return "Customer";
  if (upper === "FUNDI") return "Fundi";
  if (upper === "PROFESSIONAL") return "Professional";
  if (upper === "CONTRACTOR") return "Contractor";
  if (upper === "HARDWARE") return "Hardware";
  return value;
};

const extractContractorCategories = (value: string) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isSavedDocumentReady = (value: any) => Boolean(value && typeof value === "object" && value.name);

const ProfileScreen = () => {
  const params = useLocalSearchParams<ProfileParams>();
  const [activeSection, setActiveSection] = useState<ActiveSection>("account");
  const [savedProfile, setSavedProfile] = useState<SavedProfileData | null>(null);
  const [savedSignup, setSavedSignup] = useState<SavedSignupData | null>(null);
  const [savedUploads, setSavedUploads] = useState<SavedUploadsData | null>(null);
  const [isUploadsComplete, setIsUploadsComplete] = useState(false);
  const [sectionNotice, setSectionNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadSavedData = async () => {
      const [profileData, signupData] = await Promise.all([getProfileData(), getSignupData()]);
      if (!mounted) return;
      setSavedProfile(profileData);
      setSavedSignup(signupData);
    };

    void loadSavedData();

    return () => {
      mounted = false;
    };
  }, []);

  const profile = useMemo(
    () => ({
      userType: preferValue(
        pickFirst(params.userType),
        savedProfile?.userType || savedSignup?.userType || ""
      ),
      accountType: preferValue(pickFirst(params.accountType), savedProfile?.accountType || ""),
      firstName: preferValue(pickFirst(params.firstName), savedProfile?.firstName || ""),
      lastName: preferValue(pickFirst(params.lastName), savedProfile?.lastName || ""),
      email: preferValue(pickFirst(params.email), savedProfile?.email || ""),
      phone: preferValue(pickFirst(params.phone), savedProfile?.phone || ""),
      fundiSkill: preferValue(
        pickFirst(params.fundiSkill),
        savedProfile?.fundiSkill || savedSignup?.skill || ""
      ),
      profession: preferValue(pickFirst(params.profession), savedProfile?.profession || ""),
      contractorType: preferValue(
        pickFirst(params.contractorType),
        savedProfile?.contractorType || ""
      ),
      hardwareGroup: preferValue(pickFirst(params.hardwareGroup), savedProfile?.hardwareGroup || ""),
      county: preferValue(pickFirst(params.county), savedProfile?.county || ""),
      subCounty: preferValue(pickFirst(params.subCounty), savedProfile?.subCounty || ""),
      town: preferValue(pickFirst(params.town), savedProfile?.town || ""),
      estate: preferValue(pickFirst(params.estate), savedProfile?.estate || ""),
      heardAbout: preferValue(pickFirst(params.heardAbout), savedProfile?.heardAbout || ""),
      referralDetail: preferValue(
        pickFirst(params.referralDetail),
        savedProfile?.referralDetail || ""
      ),
      socialPlatform: preferValue(
        pickFirst(params.socialPlatform),
        savedProfile?.socialPlatform || ""
      ),
      socialMediaOther: preferValue(
        pickFirst(params.socialMediaOther),
        savedProfile?.socialMediaOther || ""
      ),
      serviceInterest: preferValue(
        pickFirst(params.serviceInterest),
        savedProfile?.serviceInterest || ""
      ),
    }),
    [
      params.accountType,
      params.contractorType,
      params.county,
      params.email,
      params.estate,
      params.firstName,
      params.fundiSkill,
      params.hardwareGroup,
      params.heardAbout,
      params.lastName,
      params.phone,
      params.profession,
      params.referralDetail,
      params.serviceInterest,
      params.socialMediaOther,
      params.socialPlatform,
      params.subCounty,
      params.town,
      params.userType,
      savedProfile,
      savedSignup,
    ]
  );

  const isCustomer = profile.userType.toUpperCase() === "CUSTOMER";
  const hasAddressInfo = Boolean(profile.county || profile.subCounty || profile.town || profile.estate);
  const welcomeName = profile.firstName || formatUserType(profile.userType || "User");
  const uploadsProfileKey = useMemo(() => {
    const keyParts = [
      profile.userType || "USER",
      profile.email || "",
      profile.phone || "",
    ]
      .join("|")
      .trim();
    return keyParts || "USER|unknown";
  }, [profile.email, profile.phone, profile.userType]);

  const roleSpecificField: InfoRow | null = (() => {
    const normalized = profile.userType.toUpperCase();
    if (normalized === "FUNDI") return { label: "Skill", value: profile.fundiSkill };
    if (normalized === "PROFESSIONAL") return { label: "Profession", value: profile.profession };
    if (normalized === "CONTRACTOR") return { label: "Contractor Type", value: profile.contractorType };
    if (normalized === "HARDWARE") return { label: "Hardware Group", value: profile.hardwareGroup };
    return null;
  })();

  const accountRows: InfoRow[] = [
    { label: "First Name", value: profile.firstName },
    { label: "Last Name", value: profile.lastName },
    { label: "Email", value: profile.email },
    { label: "Phone Number", value: profile.phone },
    ...(isCustomer ? [{ label: "Customer Account Type", value: profile.accountType }] : []),
    ...(roleSpecificField ? [roleSpecificField] : []),
    ...(isCustomer ? [{ label: "Service Interest", value: profile.serviceInterest }] : []),
  ];

  const addressRows: InfoRow[] = [
    { label: "Country", value: "Kenya" },
    { label: "County", value: profile.county },
    { label: "Sub-County", value: profile.subCounty },
    { label: "Town/City", value: profile.town },
    { label: "Estate/Village", value: profile.estate },
  ];

  const renderInfoRows = (rows: InfoRow[]) =>
    rows.map((row) => (
      <View
        key={row.label}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
      >
        <Text className="text-xs font-semibold uppercase tracking-[1px] text-slate-500">{row.label}</Text>
        <Text className="mt-1 text-base font-medium text-slate-900">{row.value || "Not provided"}</Text>
      </View>
    ));

  const isAccountComplete = useMemo(() => {
    const hasCore = Boolean(
      profile.firstName.trim() &&
        profile.lastName.trim() &&
        profile.email.trim() &&
        profile.phone.trim()
    );
    if (!hasCore) return false;

    if (isCustomer) return Boolean(profile.accountType.trim());

    const normalized = profile.userType.toUpperCase();
    if (normalized === "FUNDI") return Boolean(profile.fundiSkill.trim());
    if (normalized === "PROFESSIONAL") return Boolean(profile.profession.trim());
    if (normalized === "CONTRACTOR") return Boolean(profile.contractorType.trim());
    if (normalized === "HARDWARE") return Boolean(profile.hardwareGroup.trim());
    return false;
  }, [
    isCustomer,
    profile.accountType,
    profile.contractorType,
    profile.email,
    profile.firstName,
    profile.fundiSkill,
    profile.hardwareGroup,
    profile.lastName,
    profile.phone,
    profile.profession,
    profile.userType,
  ]);

  const isAddressComplete = useMemo(
    () =>
      Boolean(
        profile.county.trim() &&
          profile.subCounty.trim() &&
          profile.town.trim() &&
          profile.estate.trim()
      ),
    [profile.county, profile.estate, profile.subCounty, profile.town]
  );

  const handleOpenActivities = () => {
    router.push({
      pathname: "/(profileManagement)/Activity",
      params: {
        userType: profile.userType,
        accountType: profile.accountType,
        email: profile.email,
        phone: profile.phone,
        contractorType: profile.contractorType,
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    });
  };

  const handleOpenProducts = () => {
    router.push({
      pathname: "/(profileManagement)/products",
      params: {
        userType: profile.userType,
        email: profile.email,
        phone: profile.phone,
      },
    });
  };

  useEffect(() => {
    let mounted = true;
    const loadUploads = async () => {
      const uploads = await getUploadsData(uploadsProfileKey);
      if (!mounted) return;
      setSavedUploads(uploads);
    };
    void loadUploads();
    return () => {
      mounted = false;
    };
  }, [uploadsProfileKey]);

  useEffect(() => {
    const docs = savedUploads?.documents || {};
    const categoryDocs = savedUploads?.categoryDocs || {};
    const normalized = profile.userType.toUpperCase();

    if (normalized === "CUSTOMER") {
      const required =
        profile.accountType.toUpperCase() === "ORGANIZATION"
          ? ["certificateOfIncorporation", "businessPermit", "kraPIN", "companyProfile"]
          : ["idFront", "idBack", "kraPIN"];
      setIsUploadsComplete(required.every((key) => isSavedDocumentReady(docs[key])));
      return;
    }

    if (normalized === "FUNDI") {
      const required = ["idFront", "idBack", "certificate", "kraPIN"];
      setIsUploadsComplete(required.every((key) => isSavedDocumentReady(docs[key])));
      return;
    }

    if (normalized === "PROFESSIONAL") {
      const required = ["idFront", "idBack", "academicCertificate", "cv", "kraPIN", "practiceLicense"];
      setIsUploadsComplete(required.every((key) => isSavedDocumentReady(docs[key])));
      return;
    }

    if (normalized === "HARDWARE") {
      const required = ["certificateOfIncorporation", "kraPIN", "singleBusinessPermit", "companyProfile"];
      setIsUploadsComplete(required.every((key) => isSavedDocumentReady(docs[key])));
      return;
    }

    if (normalized === "CONTRACTOR") {
      const requiredBase = ["businessRegistration", "businessPermit", "kraPIN", "companyProfile"];
      const hasBase = requiredBase.every((key) => isSavedDocumentReady(docs[key]));
      if (!hasBase) {
        setIsUploadsComplete(false);
        return;
      }
      const categories = extractContractorCategories(profile.contractorType);
      if (categories.length === 0) {
        setIsUploadsComplete(false);
        return;
      }
      const hasCategories = categories.every((category) => {
        const bundle = categoryDocs[category] || {};
        return isSavedDocumentReady(bundle.certificate) && isSavedDocumentReady(bundle.license);
      });
      setIsUploadsComplete(hasCategories);
      return;
    }

    setIsUploadsComplete(false);
  }, [profile.accountType, profile.contractorType, profile.userType, savedUploads]);

  const handleSectionPress = (section: ActiveSection) => {
    if (section === "address" && !isAccountComplete) {
      setSectionNotice("Complete Account Info first before moving to Address.");
      setActiveSection("account");
      return;
    }

    if (section === "uploads" && (!isAccountComplete || !isAddressComplete)) {
      setSectionNotice("Complete Account Info and Address first before moving to Uploads.");
      if (!isAccountComplete) {
        setActiveSection("account");
        return;
      }
      setActiveSection("address");
      return;
    }

    setSectionNotice("");
    setActiveSection(section);
  };

  useEffect(() => {
    if (!isAccountComplete && activeSection !== "account") {
      setActiveSection("account");
      return;
    }

    if (activeSection === "uploads" && !isAddressComplete) {
      setActiveSection("address");
    }
  }, [activeSection, isAccountComplete, isAddressComplete]);

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

          <View className="mt-5 flex-row flex-wrap gap-2">
            <Pressable
              className={`flex-row items-center rounded-full px-3 py-2 active:opacity-80 ${
                activeSection === "account" ? "bg-blue-600/30" : "bg-white/10"
              }`}
              onPress={() => handleSectionPress("account")}
            >
              <Text className="text-xs font-semibold text-white">Account Info</Text>
              <Text className="ml-2 text-xs text-slate-200">
                {isAccountComplete ? "Complete" : "Incomplete"}
              </Text>
              {isAccountComplete ? (
                <Feather name="check-circle" size={13} color="#86EFAC" style={{ marginLeft: 6 }} />
              ) : null}
            </Pressable>

            <Pressable
              className={`flex-row items-center rounded-full px-3 py-2 active:opacity-80 ${
                activeSection === "address" ? "bg-blue-600/30" : "bg-white/10"
              }`}
              onPress={() => handleSectionPress("address")}
            >
              <Text className="text-xs font-semibold text-white">Address</Text>
              <Text className="ml-2 text-xs text-slate-200">
                {isAddressComplete ? "Complete" : "Incomplete"}
              </Text>
              {isAddressComplete ? (
                <Feather name="check-circle" size={13} color="#86EFAC" style={{ marginLeft: 6 }} />
              ) : null}
            </Pressable>

            <Pressable
              className={`flex-row items-center rounded-full px-3 py-2 active:opacity-80 ${
                activeSection === "uploads" ? "bg-blue-600/30" : "bg-white/10"
              }`}
              onPress={() => handleSectionPress("uploads")}
            >
              <Text className="text-xs font-semibold text-white">Uploads</Text>
              <Text className="ml-2 text-xs text-slate-200">
                {isUploadsComplete ? "Complete" : "Incomplete"}
              </Text>
              {isUploadsComplete ? (
                <Feather name="check-circle" size={13} color="#86EFAC" style={{ marginLeft: 6 }} />
              ) : null}
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-full bg-white/10 px-3 py-2 active:opacity-80"
              onPress={handleOpenActivities}
            >
              <Text className="text-xs font-semibold text-white">Activities</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-full bg-white/10 px-3 py-2 active:opacity-80"
              onPress={handleOpenProducts}
            >
              <Text className="text-xs font-semibold text-white">Products</Text>
            </Pressable>
          </View>
        </View>

        {sectionNotice ? (
          <View className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
            <Text className="text-xs font-medium text-amber-700">{sectionNotice}</Text>
          </View>
        ) : null}

        <View className="gap-5">
          {activeSection === "account" ? (
            <>
              <Text className="text-sm font-semibold uppercase tracking-[1px] text-slate-500">
                Account Information
              </Text>
              {renderInfoRows(accountRows)}
            </>
          ) : activeSection === "address" ? (
            <>
              <Text className="text-sm font-semibold uppercase tracking-[1px] text-slate-500">
                Address Information
              </Text>
              {renderInfoRows(addressRows)}
            </>
          ) : (
            <>
              <Text className="text-sm font-semibold uppercase tracking-[1px] text-slate-500">
                Uploads
              </Text>
              <UploadsPanel
                accountType={profile.accountType}
                contractorType={profile.contractorType}
                profileKey={uploadsProfileKey}
                userType={profile.userType}
                onCompletionChange={setIsUploadsComplete}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
