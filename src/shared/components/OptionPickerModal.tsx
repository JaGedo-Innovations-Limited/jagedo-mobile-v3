import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type OptionPickerModalProps = {
  visible: boolean;
  title: string;
  options: string[];
  onClose: () => void;
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  selectedOptions?: string[];
  onToggleOption?: (value: string) => void;
  onDone?: () => void;
  doneLabel?: string;
};

const OptionPickerModal = ({
  visible,
  title,
  options,
  onClose,
  onSelect,
  multiSelect = false,
  selectedOptions = [],
  onToggleOption,
  onDone,
  doneLabel = "Done",
}: OptionPickerModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-950/45 px-4 pb-6">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="max-h-[70%] rounded-[28px] bg-white p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-950">{title}</Text>
            <Pressable className="rounded-full bg-slate-100 px-3 py-2 active:opacity-80" onPress={onClose}>
              <Text className="text-sm font-medium text-slate-600">Close</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-2">
              {options.map((option) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <Pressable
                    key={option}
                    className={`rounded-2xl border px-4 py-4 active:bg-slate-50 ${
                      isSelected ? "border-blue-600 bg-blue-50" : "border-slate-200"
                    }`}
                    onPress={() => {
                      if (multiSelect) {
                        onToggleOption?.(option);
                        return;
                      }
                      onSelect(option);
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-base ${
                          isSelected ? "font-semibold text-blue-700" : "text-slate-800"
                        }`}
                      >
                        {option}
                      </Text>
                      {isSelected ? <Text className="text-base font-bold text-blue-700">✓</Text> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {multiSelect ? (
            <Pressable
              className="mt-4 rounded-2xl bg-blue-600 px-4 py-3 active:opacity-80"
              onPress={onDone || onClose}
            >
              <Text className="text-center text-sm font-semibold text-white">{doneLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default OptionPickerModal;
