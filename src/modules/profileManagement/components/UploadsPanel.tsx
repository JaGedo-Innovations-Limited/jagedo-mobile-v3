import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import {
  getUploadsData,
  saveUploadsData,
  type SavedUploadDocument,
} from "../../../shared/utils/profileStorage";

type UploadField = {
  label: string;
  key: string;
};

type UploadsPanelProps = {
  profileKey: string;
  userType: string;
  accountType: string;
  contractorType: string;
  onCompletionChange?: (complete: boolean) => void;
};

const NON_CONTRACTOR_FIELDS: Record<string, UploadField[]> = {
  CUSTOMER_INDIVIDUAL: [
    { label: "National ID - Front", key: "idFront" },
    { label: "National ID - Back", key: "idBack" },
    { label: "KRA PIN Certificate", key: "kraPIN" },
  ],
  CUSTOMER_ORGANIZATION: [
    { label: "Certificate of Incorporation", key: "certificateOfIncorporation" },
    { label: "Business Permit", key: "businessPermit" },
    { label: "KRA PIN Certificate", key: "kraPIN" },
    { label: "Company Profile", key: "companyProfile" },
  ],
  FUNDI: [
    { label: "ID Front", key: "idFront" },
    { label: "ID Back", key: "idBack" },
    { label: "Certificate", key: "certificate" },
    { label: "KRA PIN", key: "kraPIN" },
  ],
  PROFESSIONAL: [
    { label: "ID Front", key: "idFront" },
    { label: "ID Back", key: "idBack" },
    { label: "Academic Certificate", key: "academicCertificate" },
    { label: "CV", key: "cv" },
    { label: "KRA PIN", key: "kraPIN" },
    { label: "Practice License", key: "practiceLicense" },
  ],
  HARDWARE: [
    { label: "Certificate of Incorporation", key: "certificateOfIncorporation" },
    { label: "KRA PIN", key: "kraPIN" },
    { label: "Single Business Permit", key: "singleBusinessPermit" },
    { label: "Company Profile", key: "companyProfile" },
  ],
};

const CONTRACTOR_FIELDS: UploadField[] = [
  { label: "Business Registration", key: "businessRegistration" },
  { label: "Business Permit", key: "businessPermit" },
  { label: "KRA PIN", key: "kraPIN" },
  { label: "Company Profile", key: "companyProfile" },
];

const normalizeUserType = (value: string) => String(value || "").trim().toUpperCase();

const formatDate = (isoDate: string) => {
  if (!isoDate) return "";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString();
};

const buildPendingDocument = (label: string): SavedUploadDocument => {
  const now = new Date();
  const baseName = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return {
    name: `${baseName || "document"}.pdf`,
    uploadedAt: now.toISOString(),
    status: "pending",
    statusReason: "Awaiting verification",
  };
};

const isDocumentReady = (value: SavedUploadDocument | undefined) => Boolean(value?.name);

const UploadCard = ({
  label,
  docValue,
  onUpload,
  onRemove,
  editable = true,
}: {
  label: string;
  docValue?: SavedUploadDocument;
  onUpload: () => void;
  onRemove: () => void;
  editable?: boolean;
}) => {
  const hasDoc = Boolean(docValue?.name);
  const uploadedAt = formatDate(docValue?.uploadedAt || "");

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4">
      <View className="flex-row items-start gap-3">
        <View
          className={`h-10 w-10 items-center justify-center rounded-xl ${
            hasDoc ? "bg-emerald-100" : "bg-slate-100"
          }`}
        >
          <Feather name={hasDoc ? "file-text" : "image"} size={18} color={hasDoc ? "#059669" : "#94A3B8"} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-900">{label}</Text>
          <Text className="mt-0.5 text-xs text-slate-500">
            {hasDoc ? `${docValue?.name}${uploadedAt ? ` • ${uploadedAt}` : ""}` : "Not uploaded"}
          </Text>
        </View>
      </View>

      {hasDoc ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          <Pressable className="rounded-xl border border-slate-300 bg-white px-3 py-2 active:opacity-80">
            <Text className="text-xs font-semibold text-slate-700">View</Text>
          </Pressable>
          <Pressable className="rounded-xl border border-slate-300 bg-white px-3 py-2 active:opacity-80">
            <Text className="text-xs font-semibold text-slate-700">Download</Text>
          </Pressable>
          {editable ? (
            <>
              <Pressable className="rounded-xl bg-blue-600 px-3 py-2 active:opacity-80" onPress={onUpload}>
                <Text className="text-xs font-semibold text-white">Replace</Text>
              </Pressable>
              <Pressable
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 active:opacity-80"
                onPress={onRemove}
              >
                <Text className="text-xs font-semibold text-slate-700">Remove</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      ) : (
        <>
          {editable ? (
            <>
              <Pressable
                className="mt-3 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-3 py-2 active:opacity-80"
                onPress={onUpload}
              >
                <Text className="text-center text-xs font-semibold text-blue-600">Upload</Text>
              </Pressable>
              <Text className="mt-2 text-xs text-slate-500">
                Supported formats: PDF, JPG/JPEG (max 10 MB).
              </Text>
            </>
          ) : (
            <Text className="mt-2 text-xs text-slate-500">Uploads are locked after submission.</Text>
          )}
        </>
      )}
    </View>
  );
};

const UploadsPanel = ({
  profileKey,
  userType,
  accountType,
  contractorType,
  onCompletionChange,
}: UploadsPanelProps) => {
  const normalizedUserType = normalizeUserType(userType);
  const normalizedAccountType = String(accountType || "").trim().toUpperCase();
  const isContractor = normalizedUserType === "CONTRACTOR";
  const [documents, setDocuments] = useState<Record<string, SavedUploadDocument>>({});
  const [categoryDocs, setCategoryDocs] = useState<Record<string, Record<string, SavedUploadDocument>>>({});
  const [submissionStatus, setSubmissionStatus] = useState<"draft" | "submitted">("draft");
  const [hydrated, setHydrated] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const contractorCategories = useMemo(
    () =>
      String(contractorType || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [contractorType]
  );

  const fields = useMemo(() => {
    if (isContractor) return CONTRACTOR_FIELDS;
    if (normalizedUserType === "CUSTOMER") {
      return normalizedAccountType === "ORGANIZATION"
        ? NON_CONTRACTOR_FIELDS.CUSTOMER_ORGANIZATION
        : NON_CONTRACTOR_FIELDS.CUSTOMER_INDIVIDUAL;
    }
    return NON_CONTRACTOR_FIELDS[normalizedUserType] || [];
  }, [isContractor, normalizedAccountType, normalizedUserType]);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const saved = await getUploadsData(profileKey);
      if (!mounted) return;
      setDocuments(saved?.documents || {});
      setCategoryDocs(saved?.categoryDocs || {});
      setSubmissionStatus(saved?.submissionStatus || "draft");
      setHydrated(true);
    };

    setHydrated(false);
    void hydrate();

    return () => {
      mounted = false;
    };
  }, [profileKey]);

  useEffect(() => {
    if (!hydrated) return;
    void saveUploadsData(profileKey, {
      userType: normalizedUserType,
      documents,
      categoryDocs,
      submissionStatus,
      submittedAt: submissionStatus === "submitted" ? new Date().toISOString() : "",
    });
  }, [categoryDocs, documents, hydrated, normalizedUserType, profileKey, submissionStatus]);

  const isComplete = useMemo(() => {
    const hasBaseDocs = fields.every((field) => isDocumentReady(documents[field.key]));
    if (!isContractor) return hasBaseDocs;
    if (!hasBaseDocs) return false;
    if (contractorCategories.length === 0) return false;
    return contractorCategories.every((category) => {
      const bundle = categoryDocs[category] || {};
      return isDocumentReady(bundle.certificate) && isDocumentReady(bundle.license);
    });
  }, [categoryDocs, contractorCategories, documents, fields, isContractor]);
  const canEdit = submissionStatus !== "submitted";

  useEffect(() => {
    onCompletionChange?.(isComplete);
  }, [isComplete, onCompletionChange]);

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = setTimeout(() => setToastMessage(""), 2500);
    return () => clearTimeout(timeout);
  }, [toastMessage]);

  const handleBaseUpload = (key: string, label: string) => {
    if (submissionStatus === "submitted") return;
    setDocuments((current) => ({
      ...current,
      [key]: buildPendingDocument(label),
    }));
  };

  const handleBaseRemove = (key: string) => {
    if (submissionStatus === "submitted") return;
    setDocuments((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleCategoryUpload = (category: string, docType: "certificate" | "license", label: string) => {
    if (submissionStatus === "submitted") return;
    setCategoryDocs((current) => ({
      ...current,
      [category]: {
        ...(current[category] || {}),
        [docType]: buildPendingDocument(label),
      },
    }));
  };

  const handleCategoryRemove = (category: string, docType: "certificate" | "license") => {
    if (submissionStatus === "submitted") return;
    setCategoryDocs((current) => {
      const categoryBundle = { ...(current[category] || {}) };
      delete categoryBundle[docType];
      return {
        ...current,
        [category]: categoryBundle,
      };
    });
  };

  const handleSubmit = () => {
    if (!isComplete || submissionStatus === "submitted") return;
    setSubmissionStatus("submitted");
    setToastMessage("Documents submitted successfully.");
  };

  return (
    <View className="gap-4">
      {toastMessage ? (
        <View className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Text className="text-xs font-semibold text-emerald-700">{toastMessage}</Text>
        </View>
      ) : null}

      {!isComplete ? (
        <View className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Text className="text-xs text-amber-700">
            Please complete all required uploads before submitting.
          </Text>
        </View>
      ) : null}

      <View className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-slate-900">Uploaded Documents</Text>
            <Text className="mt-1 text-xs text-slate-500">ID documents and certificates</Text>
          </View>
          <View
            className={`rounded-full px-3 py-1.5 ${
              isComplete ? "bg-emerald-100" : "bg-blue-100"
            }`}
          >
            <Text className={`text-xs font-semibold ${isComplete ? "text-emerald-700" : "text-blue-700"}`}>
              {isComplete ? "Uploads Complete" : "Upload documents for submission"}
            </Text>
          </View>
        </View>
        {submissionStatus === "submitted" ? (
          <View className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
            <Text className="text-xs font-medium text-blue-700">Submitted for verification.</Text>
          </View>
        ) : null}
      </View>

      <View className="gap-3">
        {fields.map((field) => (
          <UploadCard
            key={field.key}
            label={field.label}
            docValue={documents[field.key]}
            editable={canEdit}
            onUpload={() => handleBaseUpload(field.key, field.label)}
            onRemove={() => handleBaseRemove(field.key)}
          />
        ))}
      </View>

      {isContractor ? (
        <View className="gap-4">
          <Text className="text-sm font-semibold uppercase tracking-[1px] text-slate-500">
            Category Licences & Certificates
          </Text>
          {contractorCategories.length === 0 ? (
            <View className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Text className="text-xs text-amber-700">
                Add contractor categories in account info to unlock category uploads.
              </Text>
            </View>
          ) : (
            contractorCategories.map((category) => (
              <View key={category} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <Text className="mb-3 text-sm font-semibold text-slate-900">{category}</Text>
                <View className="gap-3">
                  <UploadCard
                    label={`${category} Certificate`}
                    docValue={categoryDocs[category]?.certificate}
                    editable={canEdit}
                    onUpload={() =>
                      handleCategoryUpload(category, "certificate", `${category} Certificate`)
                    }
                    onRemove={() => handleCategoryRemove(category, "certificate")}
                  />
                  <UploadCard
                    label={`${category} Practice License`}
                    docValue={categoryDocs[category]?.license}
                    editable={canEdit}
                    onUpload={() => handleCategoryUpload(category, "license", `${category} Practice License`)}
                    onRemove={() => handleCategoryRemove(category, "license")}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      <View className="mt-2 items-end">
        <Pressable
          className={`rounded-xl px-8 py-3 ${
            isComplete && submissionStatus !== "submitted" ? "bg-blue-600" : "bg-slate-300"
          }`}
          onPress={handleSubmit}
          disabled={!isComplete || submissionStatus === "submitted"}
        >
          <Text
            className={`text-sm font-semibold ${
              isComplete && submissionStatus !== "submitted" ? "text-white" : "text-slate-600"
            }`}
          >
            {submissionStatus === "submitted" ? "Submitted" : "Submit"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default UploadsPanel;
