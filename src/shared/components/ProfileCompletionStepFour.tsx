import React from "react";
import { View } from "react-native";
import { ProfileCompletionSelectField } from "./ProfileCompletionField";

type ProfileCompletionStepFourProps = {
  referralSource: string;
  socialPlatform: string;
  serviceInterest: string;
  openReferralPicker: () => void;
  openSocialPlatformPicker: () => void;
  openServicePicker: () => void;
  errors: Record<string, string>;
};

const ProfileCompletionStepFour = ({
  referralSource,
  socialPlatform,
  serviceInterest,
  openReferralPicker,
  openSocialPlatformPicker,
  openServicePicker,
  errors,
}: ProfileCompletionStepFourProps) => {
  return (
    <View>
      <ProfileCompletionSelectField
        label="How did you hear about us? *"
        value={referralSource}
        placeholder="Select option"
        onPress={openReferralPicker}
        error={errors.referralSource}
      />

      {referralSource === "Social Media" ? (
        <ProfileCompletionSelectField
          label="Which platform did you see us on? *"
          value={socialPlatform}
          placeholder="Select social platform"
          onPress={openSocialPlatformPicker}
          error={errors.socialPlatform}
        />
      ) : null}

      <ProfileCompletionSelectField
        label="What services are you interested in? *"
        value={serviceInterest}
        placeholder="Select a service"
        onPress={openServicePicker}
        error={errors.serviceInterest}
      />
    </View>
  );
};

export default ProfileCompletionStepFour;
