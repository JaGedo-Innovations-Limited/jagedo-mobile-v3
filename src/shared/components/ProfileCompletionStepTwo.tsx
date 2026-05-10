import React from "react";
import { View } from "react-native";
import {
  ProfileCompletionSelectField,
  ProfileCompletionTextField,
} from "./ProfileCompletionField";

type ProfileCompletionStepTwoProps = {
  county: string;
  subCounty: string;
  cityTown: string;
  estateVillage: string;
  openCountyPicker: () => void;
  openSubCountyPicker: () => void;
  setCityTown: (value: string) => void;
  setEstateVillage: (value: string) => void;
  errors: Record<string, string>;
};

const ProfileCompletionStepTwo = ({
  county,
  subCounty,
  cityTown,
  estateVillage,
  openCountyPicker,
  openSubCountyPicker,
  setCityTown,
  setEstateVillage,
  errors,
}: ProfileCompletionStepTwoProps) => {
  return (
    <View>
      <ProfileCompletionSelectField
        label="County"
        value={county}
        placeholder="Select county"
        onPress={openCountyPicker}
        error={errors.county}
      />
      <ProfileCompletionSelectField
        label="Sub-County"
        value={subCounty}
        placeholder="Select Sub-County"
        onPress={openSubCountyPicker}
        error={errors.subCounty}
      />
      <ProfileCompletionTextField
        label="City/Town"
        value={cityTown}
        onChangeText={setCityTown}
        error={errors.cityTown}
      />
      <ProfileCompletionTextField
        label="Estate/Village"
        value={estateVillage}
        onChangeText={setEstateVillage}
        error={errors.estateVillage}
      />
    </View>
  );
};

export default ProfileCompletionStepTwo;
