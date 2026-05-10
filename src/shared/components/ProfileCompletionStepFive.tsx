import React from "react";
import { View } from "react-native";
import { ProfileCompletionTextField } from "./ProfileCompletionField";

type ProfileCompletionStepFiveProps = {
  newPassword: string;
  confirmPassword: string;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  errors: Record<string, string>;
};

const ProfileCompletionStepFive = ({
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  errors,
}: ProfileCompletionStepFiveProps) => {
  return (
    <View>
      <ProfileCompletionTextField
        label="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        error={errors.newPassword}
      />
      <ProfileCompletionTextField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        error={errors.confirmPassword}
      />
    </View>
  );
};

export default ProfileCompletionStepFive;
