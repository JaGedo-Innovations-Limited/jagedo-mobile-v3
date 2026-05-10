import { Text, View } from "react-native";

import { BackArrow } from "../components";

export function BuilderSignupScreen() {
  return (
    <View className="flex-1 bg-[#f2f4f8] px-6 pt-10">
      <View className="mx-auto w-full max-w-[450px]">
        <BackArrow />
        <View className="rounded-2xl border border-[#e4e7ed] bg-white px-8 py-10">
          <Text className="text-center text-[28px] font-bold text-[#0f172a]">
            Builder Sign Up
          </Text>
          <Text className="mt-3 text-center text-[16px] text-[#64748b]">
            Builder signup UI will be implemented next.
          </Text>
        </View>
      </View>
    </View>
  );
}
