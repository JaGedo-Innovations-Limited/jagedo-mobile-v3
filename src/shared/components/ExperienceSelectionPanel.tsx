import React from "react";
import { Text, View } from "react-native";
import { ProfileCompletionSelectField } from "./ProfileCompletionField";

type ExperienceSelectionPanelProps = {
  primaryLabel: string;
  primaryValue: string;
  primaryPlaceholder: string;
  primaryReadonly?: boolean;
  onOpenPrimary?: () => void;
  secondaryLabel: string;
  secondaryValue: string;
  secondaryPlaceholder: string;
  onOpenSecondary: () => void;
  tertiaryLabel: string;
  tertiaryValue: string;
  tertiaryPlaceholder: string;
  onOpenTertiary: () => void;
  quaternaryLabel: string;
  quaternaryValue: string;
  quaternaryPlaceholder: string;
  onOpenQuaternary: () => void;
  errors: Record<string, string>;
  primaryErrorKey: string;
  secondaryErrorKey: string;
  tertiaryErrorKey: string;
  quaternaryErrorKey: string;
};

const ExperienceSelectionPanel = ({
  primaryLabel,
  primaryValue,
  primaryPlaceholder,
  primaryReadonly,
  onOpenPrimary,
  secondaryLabel,
  secondaryValue,
  secondaryPlaceholder,
  onOpenSecondary,
  tertiaryLabel,
  tertiaryValue,
  tertiaryPlaceholder,
  onOpenTertiary,
  quaternaryLabel,
  quaternaryValue,
  quaternaryPlaceholder,
  onOpenQuaternary,
  errors,
  primaryErrorKey,
  secondaryErrorKey,
  tertiaryErrorKey,
  quaternaryErrorKey,
}: ExperienceSelectionPanelProps) => {
  return (
    <View className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <View className="gap-2">
        {primaryReadonly ? (
          <View className="mb-5">
            <Text className="mb-3 text-[15px] font-medium text-slate-800">{primaryLabel}</Text>
            <View className="self-start rounded-2xl bg-slate-200 px-4 py-3">
              <Text className="text-base font-medium text-slate-800">{primaryValue}</Text>
            </View>
          </View>
        ) : (
          <ProfileCompletionSelectField
            label={primaryLabel}
            value={primaryValue}
            placeholder={primaryPlaceholder}
            onPress={() => onOpenPrimary?.()}
            error={errors[primaryErrorKey]}
          />
        )}

        <ProfileCompletionSelectField
          label={secondaryLabel}
          value={secondaryValue}
          placeholder={secondaryPlaceholder}
          onPress={onOpenSecondary}
          error={errors[secondaryErrorKey]}
        />

        <ProfileCompletionSelectField
          label={tertiaryLabel}
          value={tertiaryValue}
          placeholder={tertiaryPlaceholder}
          onPress={onOpenTertiary}
          error={errors[tertiaryErrorKey]}
        />

        <ProfileCompletionSelectField
          label={quaternaryLabel}
          value={quaternaryValue}
          placeholder={quaternaryPlaceholder}
          onPress={onOpenQuaternary}
          error={errors[quaternaryErrorKey]}
        />
      </View>
    </View>
  );
};

export default ExperienceSelectionPanel;
