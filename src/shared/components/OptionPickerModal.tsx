import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type OptionPickerModalProps = {
  visible: boolean;
  title: string;
  options: string[];
  onClose: () => void;
  onSelect: (value: string) => void;
};

const OptionPickerModal = ({
  visible,
  title,
  options,
  onClose,
  onSelect,
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
              {options.map((option) => (
                <Pressable
                  key={option}
                  className="rounded-2xl border border-slate-200 px-4 py-4 active:bg-slate-50"
                  onPress={() => onSelect(option)}
                >
                  <Text className="text-base text-slate-800">{option}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default OptionPickerModal;
