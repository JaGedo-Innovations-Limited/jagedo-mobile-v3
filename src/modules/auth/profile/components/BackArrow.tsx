import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform, Pressable, Text } from "react-native";

type BackArrowProps = {
  label?: string;
};

export function BackArrow({ label = "Back to Home" }: BackArrowProps) {
  const router = useRouter();

  const handleBack = () => {
    router.replace("/");
  };

  return (
    <Pressable className="mb-6 flex-row items-center self-start" onPress={handleBack}>
      <MaterialCommunityIcons color="#5d6f89" name="arrow-left" size={18} />
      <Text
        className="ml-2 text-[16px] font-medium text-[#5d6f89]"
        style={{ fontFamily: Platform.OS === "web" ? "Segoe UI, Arial, sans-serif" : undefined }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
