import { Pressable, Text, View } from "react-native";

import type { CustomerAccountType } from "../customer/customerSignup.data";
import { CUSTOMER_ACCOUNT_TYPES } from "../customer/customerSignup.data";

type CustomerAccountTypeSelectorProps = {
  value: CustomerAccountType;
  onChange: (value: CustomerAccountType) => void;
};

export function CustomerAccountTypeSelector({
  value,
  onChange,
}: CustomerAccountTypeSelectorProps) {
  return (
    <View className="w-full">
      <Text className="mb-3 text-center text-[18px] font-semibold text-[#0f172a]">
        Select Account Type
      </Text>

      <View className="flex-row gap-3">
        {CUSTOMER_ACCOUNT_TYPES.map((accountType) => {
          const isSelected = value === accountType.value;
          return (
            <Pressable
              className={`h-12 flex-1 items-center justify-center rounded-xl ${
                isSelected ? "bg-[#0b0f9f]" : "bg-[#d2d6de]"
              }`}
              key={accountType.value}
              onPress={() => onChange(accountType.value)}
            >
              <Text
                className={`text-[17px] font-medium ${
                  isSelected ? "text-white" : "text-[#4b5563]"
                }`}
              >
                {accountType.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
