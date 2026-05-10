import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type DocumentCardProps = {
  title: string;
  value: string;
  onUpload: () => void;
};

const DocumentCard = ({ title, value, onUpload }: DocumentCardProps) => {
  const uploaded = value.length > 0;

  return (
    <View className="mb-5 rounded-[24px] border border-slate-200 bg-white p-4">
      <View className="mb-4 flex-row items-center gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <Feather name="file-text" size={28} color="#94A3B8" />
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-medium text-slate-800">{title}</Text>
          <Text className={`mt-1 text-sm ${uploaded ? "text-emerald-600" : "text-red-500"}`}>
            {uploaded ? value : "Not uploaded"}
          </Text>
        </View>
      </View>

      <Pressable
        className="flex-row items-center justify-center gap-3 rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-4 py-4 active:opacity-90"
        onPress={onUpload}
      >
        <Feather name="upload" size={20} color="#2563EB" />
        <Text className="text-[16px] font-medium text-blue-600">
          {uploaded ? "Replace upload" : "Upload"}
        </Text>
      </Pressable>
    </View>
  );
};

type ProfileCompletionStepThreeProps = {
  idFront: string;
  idBack: string;
  kraPin: string;
  setIdFront: (value: string) => void;
  setIdBack: (value: string) => void;
  setKraPin: (value: string) => void;
};

const ProfileCompletionStepThree = ({
  idFront,
  idBack,
  kraPin,
  setIdFront,
  setIdBack,
  setKraPin,
}: ProfileCompletionStepThreeProps) => {
  return (
    <View>
      <DocumentCard title="ID Front" value={idFront} onUpload={() => setIdFront("id-front-uploaded.jpg")} />
      <DocumentCard title="ID Back" value={idBack} onUpload={() => setIdBack("id-back-uploaded.jpg")} />
      <DocumentCard title="KRA Pin" value={kraPin} onUpload={() => setKraPin("kra-pin-uploaded.pdf")} />
    </View>
  );
};

export default ProfileCompletionStepThree;
