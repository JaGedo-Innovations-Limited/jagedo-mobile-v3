import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  countySubCountyMap,
  kenyanCounties,
  referralOptions,
  serviceInterestOptions,
  socialPlatformOptions,
} from "../constants/profileCompletion";
import {
  FUNDI_EXPERIENCE_OPTIONS,
  FUNDI_GRADE_OPTIONS,
  FUNDI_GRADE_PROJECT_COUNT,
  FUNDI_SPECIALIZATIONS,
} from "../constants/experience";
import CompleteProfileStepIndicator from "./CompleteProfileStepIndicator";
import OptionPickerModal from "./OptionPickerModal";
import ProfileCompletionStepFive from "./ProfileCompletionStepFive";
import ProfileCompletionStepFour from "./ProfileCompletionStepFour";
import ProfileCompletionStepOne from "./ProfileCompletionStepOne";
import ProfileCompletionStepThree from "./ProfileCompletionStepThree";
import ProfileCompletionStepTwo from "./ProfileCompletionStepTwo";
import Experience from "../../modules/profileManagement/components/fundi/Experience";

type CompleteProfileModalProps = {
  visible: boolean;
  onClose: () => void;
  userType?: string;
  selectedSkill?: string;
};

type PickerType =
  | "county"
  | "subCounty"
  | "specialization"
  | "grade"
  | "experience"
  | "referral"
  | "socialPlatform"
  | "service"
  | null;

const CompleteProfileModal = ({
  visible,
  onClose,
  userType = "Fundi",
  selectedSkill = "",
}: CompleteProfileModalProps) => {
  const isFundiFlow = userType === "Fundi";
  const totalSteps = 5;
  const [step, setStep] = useState(1);
  const [openPicker, setOpenPicker] = useState<PickerType>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");

  const [county, setCounty] = useState("");
  const [subCounty, setSubCounty] = useState("");
  const [cityTown, setCityTown] = useState("");
  const [estateVillage, setEstateVillage] = useState("");

  const [idFront, setIdFront] = useState("");
  const [idBack, setIdBack] = useState("");
  const [kraPin, setKraPin] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [grade, setGrade] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [projects, setProjects] = useState([
    { name: "", fileName: "" },
    { name: "", fileName: "" },
    { name: "", fileName: "" },
  ]);

  const [referralSource, setReferralSource] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("");
  const [serviceInterest, setServiceInterest] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!visible) {
      setStep(1);
      setOpenPicker(null);
      setErrors({});
    }
  }, [visible]);

  useEffect(() => {
    setSpecialization("");
    setGrade("");
    setYearsOfExperience("");
    setProjects([
      { name: "", fileName: "" },
      { name: "", fileName: "" },
      { name: "", fileName: "" },
    ]);
  }, [selectedSkill, userType]);

  const availableSubCounties = useMemo(() => {
    if (!county) {
      return [];
    }

    return countySubCountyMap[county] || [];
  }, [county]);

  const pickerConfig = useMemo(() => {
    switch (openPicker) {
      case "county":
        return {
          title: "Select county",
          options: kenyanCounties,
          onSelect: (value: string) => {
            setCounty(value);
            setSubCounty("");
            setOpenPicker(null);
          },
        };
      case "subCounty":
        return {
          title: "Select sub-county",
          options: availableSubCounties,
          onSelect: (value: string) => {
            setSubCounty(value);
            setOpenPicker(null);
          },
        };
      case "specialization":
        return {
          title: "Select specialization",
          options: FUNDI_SPECIALIZATIONS[selectedSkill as keyof typeof FUNDI_SPECIALIZATIONS] || [],
          onSelect: (value: string) => {
            setSpecialization(value);
            setOpenPicker(null);
          },
        };
      case "grade":
        return {
          title: "Select grade",
          options: FUNDI_GRADE_OPTIONS,
          onSelect: (value: string) => {
            setGrade(value);
            setProjects([
              { name: "", fileName: "" },
              { name: "", fileName: "" },
              { name: "", fileName: "" },
            ]);
            setOpenPicker(null);
          },
        };
      case "experience":
        return {
          title: "Select experience",
          options: FUNDI_EXPERIENCE_OPTIONS,
          onSelect: (value: string) => {
            setYearsOfExperience(value);
            setOpenPicker(null);
          },
        };
      case "referral":
        return {
          title: "Select option",
          options: referralOptions,
          onSelect: (value: string) => {
            setReferralSource(value);
            if (value !== "Social Media") {
              setSocialPlatform("");
            }
            setOpenPicker(null);
          },
        };
      case "socialPlatform":
        return {
          title: "Select social platform",
          options: socialPlatformOptions,
          onSelect: (value: string) => {
            setSocialPlatform(value);
            setOpenPicker(null);
          },
        };
      case "service":
        return {
          title: "Select a service",
          options: serviceInterestOptions,
          onSelect: (value: string) => {
            setServiceInterest(value);
            setOpenPicker(null);
          },
        };
      default:
        return null;
    }
  }, [availableSubCounties, openPicker, selectedSkill]);

  const closeModal = () => {
    setOpenPicker(null);
    onClose();
  };

  const validateStep = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!firstName.trim()) nextErrors.firstName = "First name is required.";
      if (!lastName.trim()) nextErrors.lastName = "Last name is required.";
      if (!/^(07|01)\d{8}$/.test(phoneNumber.replace(/\D/g, ""))) {
        nextErrors.phoneNumber = "Use a valid Kenyan mobile number starting with 07 or 01.";
      }
      if (!/\S+@\S+\.\S+/.test(emailAddress.trim())) {
        nextErrors.emailAddress = "Enter a valid email address.";
      }
    }

    if (step === 2) {
      if (!county) nextErrors.county = "County is required.";
      if (!subCounty) nextErrors.subCounty = "Sub-county is required.";
      if (!cityTown.trim()) nextErrors.cityTown = "City or town is required.";
      if (!estateVillage.trim()) nextErrors.estateVillage = "Estate or village is required.";
    }

    if (step === 3) {
      if (isFundiFlow) {
        if (!specialization) nextErrors.specialization = "Select a specialization.";
        if (!grade) nextErrors.grade = "Select a grade.";
        if (!yearsOfExperience) nextErrors.experience = "Select experience.";

        const requiredProjects = FUNDI_GRADE_PROJECT_COUNT[grade] ?? 0;
        for (let index = 0; index < requiredProjects; index += 1) {
          if (!projects[index].name.trim()) {
            nextErrors[`projectName_${index}`] = "Project name is required.";
          }
          if (!projects[index].fileName.trim()) {
            nextErrors[`projectFile_${index}`] = "Upload a project file.";
          }
        }
      } else {
        if (!idFront) nextErrors.idFront = "Upload ID front.";
        if (!idBack) nextErrors.idBack = "Upload ID back.";
        if (!kraPin) nextErrors.kraPin = "Upload KRA pin document.";
      }
    }

    if (step === 4) {
      if (!referralSource) nextErrors.referralSource = "Please tell us how you heard about us.";
      if (referralSource === "Social Media" && !socialPlatform) {
        nextErrors.socialPlatform = "Please choose the social platform.";
      }
      if (!serviceInterest) nextErrors.serviceInterest = "Select a service interest.";
    }

    if (step === 5) {
      if (newPassword.length < 8) {
        nextErrors.newPassword = "Password must be at least 8 characters long.";
      }
      if (confirmPassword !== newPassword || !confirmPassword) {
        nextErrors.confirmPassword = "Passwords must match.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) {
      return;
    }

    if (step === totalSteps) {
      closeModal();
      router.push({
        pathname: "/profile",
        params: {
          userType,
          skill: selectedSkill,
          specialization,
          grade,
          experience: yearsOfExperience,
        },
      });
      return;
    }

    setStep((current) => current + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      closeModal();
      return;
    }

    setErrors({});
    setStep((current) => current - 1);
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <ProfileCompletionStepOne
          firstName={firstName}
          lastName={lastName}
          phoneNumber={phoneNumber}
          emailAddress={emailAddress}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setPhoneNumber={setPhoneNumber}
          setEmailAddress={setEmailAddress}
          errors={errors}
        />
      );
    }

    if (step === 2) {
      return (
        <ProfileCompletionStepTwo
          county={county}
          subCounty={subCounty}
          cityTown={cityTown}
          estateVillage={estateVillage}
          openCountyPicker={() => setOpenPicker("county")}
          openSubCountyPicker={() => setOpenPicker("subCounty")}
          setCityTown={setCityTown}
          setEstateVillage={setEstateVillage}
          errors={errors}
        />
      );
    }

    if (step === 3) {
      if (isFundiFlow) {
        return (
          <Experience
            selectedSkill={selectedSkill}
            specialization={specialization}
            grade={grade}
            experience={yearsOfExperience}
            projects={projects}
            errors={errors}
            onOpenSpecialization={() => setOpenPicker("specialization")}
            onOpenGrade={() => setOpenPicker("grade")}
            onOpenExperience={() => setOpenPicker("experience")}
            onProjectNameChange={(index, value) => {
              setProjects((current) =>
                current.map((project, projectIndex) =>
                  projectIndex === index ? { ...project, name: value } : project,
                ),
              );
            }}
            onProjectFileUpload={(index) => {
              setProjects((current) =>
                current.map((project, projectIndex) =>
                  projectIndex === index
                    ? { ...project, fileName: `project-${index + 1}-upload.pdf` }
                    : project,
                ),
              );
            }}
          />
        );
      }

      return (
        <View>
          <ProfileCompletionStepThree
            idFront={idFront}
            idBack={idBack}
            kraPin={kraPin}
            setIdFront={setIdFront}
            setIdBack={setIdBack}
            setKraPin={setKraPin}
          />
          {(errors.idFront || errors.idBack || errors.kraPin) ? (
            <Text className="mb-4 text-sm text-red-500">
              Please upload all required documents before continuing.
            </Text>
          ) : null}
        </View>
      );
    }

    if (step === 4) {
      return (
        <ProfileCompletionStepFour
          referralSource={referralSource}
          socialPlatform={socialPlatform}
          serviceInterest={serviceInterest}
          openReferralPicker={() => setOpenPicker("referral")}
          openSocialPlatformPicker={() => setOpenPicker("socialPlatform")}
          openServicePicker={() => setOpenPicker("service")}
          errors={errors}
        />
      );
    }

    return (
      <ProfileCompletionStepFive
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        setNewPassword={setNewPassword}
        setConfirmPassword={setConfirmPassword}
        errors={errors}
      />
    );
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={closeModal}>
        <View className="flex-1 justify-end bg-slate-950/40 px-3 pb-4">
          <View className="max-h-[92%] rounded-[28px] bg-white px-5 pb-5 pt-6">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[24px] font-bold text-slate-950">Complete Your Profile</Text>
              <Pressable className="h-10 w-10 items-center justify-center rounded-full active:bg-slate-100" onPress={closeModal}>
                <Feather name="x" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <CompleteProfileStepIndicator currentStep={step} totalSteps={totalSteps} />

            <ScrollView
              className="max-h-[520px]"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {renderStep()}
            </ScrollView>

            <View className="mt-4 flex-row gap-4">
              <Pressable
                className="flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-4 active:opacity-90"
                onPress={handleBack}
              >
                <Text className="text-[16px] font-medium text-slate-700">Back</Text>
              </Pressable>

              <Pressable
                className="flex-1 items-center justify-center rounded-2xl bg-violet-600 px-4 py-4 active:opacity-90"
                onPress={handleContinue}
              >
                <Text className="text-[16px] font-semibold text-white">Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {pickerConfig ? (
        <OptionPickerModal
          visible={openPicker !== null}
          title={pickerConfig.title}
          options={pickerConfig.options}
          onClose={() => setOpenPicker(null)}
          onSelect={pickerConfig.onSelect}
        />
      ) : null}
    </>
  );
};

export default CompleteProfileModal;
