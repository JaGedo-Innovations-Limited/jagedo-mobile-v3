import { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type DropdownOption<T extends string> = {
  label: string;
  value: T;
  icon?: string;
};

type AccountTypeDropdownProps<T extends string> = {
  label: string;
  placeholder: string;
  options: Array<DropdownOption<T>>;
  value: T | null;
  onChange: (value: T) => void;
};

export function AccountTypeDropdown<T extends string>({
  label,
  placeholder,
  options,
  value,
  onChange,
}: AccountTypeDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<T | null>(null);
  const textStyle = {
    fontFamily: Platform.OS === "web" ? "Segoe UI, Arial, sans-serif" : undefined,
  };

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? placeholder,
    [options, placeholder, value]
  );

  return (
    <View className="w-full">
      <Text className="mb-2 text-[15px] font-bold text-[#1f2937]" style={textStyle}>
        {label}
      </Text>
      <Pressable
        className={`h-12 w-full flex-row items-center justify-between rounded-xl border px-4 ${
          open ? "rounded-b-none border-[#9fb3d9]" : "border-[#c8ced8]"
        } bg-white`}
        onPress={() => setOpen((current) => !current)}
      >
        <Text className="text-[17px] font-medium text-[#111827]" style={textStyle}>
          {selectedLabel}
        </Text>
        <Text className="text-[17px] text-[#7c8595]" style={textStyle}>
          {open ? "^" : "v"}
        </Text>
      </Pressable>

      {open ? (
        <View className="rounded-b-xl border border-t-0 border-[#9fb3d9] bg-white">
          {options.map((option) => {
            const isSelected = option.value === value;
            const isHovered = hoveredOption === option.value;
            return (
              <Pressable
                className={`flex-row items-center px-4 py-3 ${
                  isSelected || isHovered ? "bg-[#eceff4]" : "bg-white"
                }`}
                key={option.value}
                onHoverIn={() => setHoveredOption(option.value)}
                onHoverOut={() => setHoveredOption(null)}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                  setHoveredOption(null);
                }}
              >
                {option.icon ? (
                  <MaterialCommunityIcons
                    color="#22c55e"
                    name={option.icon as never}
                    size={18}
                    style={{ marginRight: 10 }}
                  />
                ) : null}

                <Text
                  className={`text-[16px] ${isSelected ? "text-[#0b2a73]" : "text-[#111827]"}`}
                  style={textStyle}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
