import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@jagedo/profile_data_v1";

export type SavedSignupData = {
  userType: string;
  skill: string;
  contact: string;
};

export type SavedProfileData = {
  userType: string;
  accountType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fundiSkill: string;
  profession: string;
  contractorType: string;
  hardwareGroup: string;
  county: string;
  subCounty: string;
  town: string;
  estate: string;
  heardAbout: string;
  referralDetail: string;
  socialPlatform: string;
  socialMediaOther: string;
  serviceInterest: string;
};

export type SavedUploadDocument = {
  name: string;
  uploadedAt: string;
  status: "pending" | "approved" | "reupload_requested" | "rejected";
  statusReason: string;
};

export type SavedUploadsData = {
  userType: string;
  documents: Record<string, SavedUploadDocument>;
  categoryDocs: Record<string, Record<string, SavedUploadDocument>>;
  submissionStatus?: "draft" | "submitted";
  submittedAt?: string;
};

export type SavedProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  region: string;
  bid: string;
  sku: string;
  material: string;
  size: string;
  color: string;
  uom: string;
  customPrice: number;
  images: string[];
  status: "draft" | "pending_approval" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export type SavedProductsData = {
  userType: string;
  products: SavedProduct[];
};

type StoredProfilePayload = {
  signup?: SavedSignupData;
  profile?: SavedProfileData;
  uploadsByProfileKey?: Record<string, SavedUploadsData>;
  productsByProfileKey?: Record<string, SavedProductsData>;
};

const readStorage = async (): Promise<StoredProfilePayload> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredProfilePayload;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeStorage = async (payload: StoredProfilePayload) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const saveSignupData = async (signup: SavedSignupData) => {
  const current = await readStorage();
  await writeStorage({
    ...current,
    signup,
  });
};

export const saveProfileData = async (profile: SavedProfileData) => {
  const current = await readStorage();
  await writeStorage({
    ...current,
    profile,
  });
};

export const getSignupData = async (): Promise<SavedSignupData | null> => {
  const current = await readStorage();
  return current.signup || null;
};

export const getProfileData = async (): Promise<SavedProfileData | null> => {
  const current = await readStorage();
  return current.profile || null;
};

export const saveUploadsData = async (profileKey: string, uploads: SavedUploadsData) => {
  const current = await readStorage();
  const existing = current.uploadsByProfileKey || {};
  await writeStorage({
    ...current,
    uploadsByProfileKey: {
      ...existing,
      [profileKey]: uploads,
    },
  });
};

export const getUploadsData = async (profileKey: string): Promise<SavedUploadsData | null> => {
  const current = await readStorage();
  const existing = current.uploadsByProfileKey || {};
  return existing[profileKey] || null;
};

export const saveProductsData = async (profileKey: string, productsData: SavedProductsData) => {
  const current = await readStorage();
  const existing = current.productsByProfileKey || {};
  await writeStorage({
    ...current,
    productsByProfileKey: {
      ...existing,
      [profileKey]: productsData,
    },
  });
};

export const getProductsData = async (profileKey: string): Promise<SavedProductsData | null> => {
  const current = await readStorage();
  const existing = current.productsByProfileKey || {};
  return existing[profileKey] || null;
};
