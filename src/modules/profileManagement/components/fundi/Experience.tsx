import React from "react";
import { Pressable, Text, View } from "react-native";
import {
  FUNDI_EXPERIENCE_OPTIONS,
  FUNDI_GRADE_OPTIONS,
  FUNDI_GRADE_PROJECT_COUNT,
  FUNDI_SPECIALIZATIONS,
} from "../../../../shared/constants/experience";
import {
  ProfileCompletionSelectField,
  ProfileCompletionTextField,
} from "../../../../shared/components/ProfileCompletionField";

type ProjectUpload = {
  name: string;
  fileName: string;
};

type ExperienceProps = {
  selectedSkill: string;
  specialization: string;
  grade: string;
  experience: string;
  projects: ProjectUpload[];
  errors: Record<string, string>;
  onOpenSpecialization: () => void;
  onOpenGrade: () => void;
  onOpenExperience: () => void;
  onProjectNameChange: (index: number, value: string) => void;
  onProjectFileUpload: (index: number) => void;
};

const Experience = ({
  selectedSkill,
  specialization,
  grade,
  experience,
  projects,
  errors,
  onOpenSpecialization,
  onOpenGrade,
  onOpenExperience,
  onProjectNameChange,
  onProjectFileUpload,
}: ExperienceProps) => {
  const requiredProjectCount = FUNDI_GRADE_PROJECT_COUNT[grade] ?? 0;
  const specializationOptions =
    FUNDI_SPECIALIZATIONS[selectedSkill as keyof typeof FUNDI_SPECIALIZATIONS] || [];

  return (
    <View>
      <View className="mb-5 rounded-[24px] border border-blue-200 bg-blue-50 px-4 py-4">
        <Text className="text-lg font-semibold text-blue-800">Next Steps</Text>
        <Text className="mt-3 text-sm leading-6 text-blue-700">
          - You will attend a <Text className="font-semibold">15-minute interview</Text> after
          submission.
        </Text>
        <Text className="mt-2 text-sm leading-6 text-blue-700">
          - Verification typically takes between <Text className="font-semibold">7 to 14 days</Text>{" "}
          based on your work review.
        </Text>
      </View>

      <View className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <View className="mb-4 gap-4">
          <View>
            <Text className="mb-3 text-[15px] font-medium text-slate-800">Skill</Text>
            <View className="self-start rounded-2xl bg-slate-200 px-4 py-3">
              <Text className="text-base font-medium text-slate-800">{selectedSkill}</Text>
            </View>
          </View>

          <ProfileCompletionSelectField
            label="Specialization"
            value={specialization}
            placeholder={specializationOptions.length ? "Select" : "No specialization options"}
            onPress={onOpenSpecialization}
            error={errors.specialization}
          />

          <ProfileCompletionSelectField
            label="Grade"
            value={grade}
            placeholder="Select Grade"
            onPress={onOpenGrade}
            error={errors.grade}
          />

          <ProfileCompletionSelectField
            label="Experience"
            value={experience}
            placeholder="Select Experience"
            onPress={onOpenExperience}
            error={errors.experience}
          />
        </View>
      </View>

      {requiredProjectCount > 0 ? (
        <View className="mt-5 rounded-[24px] border border-blue-200 bg-blue-50 px-4 py-4">
          <Text className="text-lg font-semibold text-blue-800">
            Add Missing Projects ({requiredProjectCount} remaining)
          </Text>
          <Text className="mt-2 text-sm leading-6 text-blue-700">
            Add projects to complete your experience profile.
          </Text>

          <View className="mt-4 gap-4">
            {projects.slice(0, requiredProjectCount).map((project, index) => (
              <View
                key={`project-${index + 1}`}
                className="rounded-[22px] border border-blue-200 bg-white p-4"
              >
                <Text className="text-lg font-semibold text-slate-900">Project {index + 1}</Text>

                <View className="mt-4 gap-4">
                  <ProfileCompletionTextField
                    label="Project Name"
                    value={project.name}
                    placeholder="Enter project name"
                    onChangeText={(value) => onProjectNameChange(index, value)}
                    error={errors[`projectName_${index}`]}
                  />

                  <View>
                    <Text className="mb-3 text-[15px] font-medium text-slate-800">
                      Project Files
                    </Text>
                    <Pressable
                      className={`rounded-2xl border border-dashed px-4 py-4 ${
                        project.name.trim()
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-300 bg-slate-50"
                      }`}
                      onPress={() => {
                        if (project.name.trim()) {
                          onProjectFileUpload(index);
                        }
                      }}
                    >
                      <Text
                        className={`text-base font-medium ${
                          project.name.trim() ? "text-blue-600" : "text-slate-400"
                        }`}
                      >
                        {project.fileName || "Choose File"}
                      </Text>
                    </Pressable>
                    <Text className="mt-3 text-xs leading-5 text-slate-500">
                      Supported formats: PDF, JPG/JPEG, CSV, XLS/XLSX, MP4 video (max 10 MB).
                    </Text>
                    {!project.name.trim() ? (
                      <Text className="mt-2 text-sm text-orange-500">
                        Enter project name first to unlock file upload.
                      </Text>
                    ) : null}
                    {errors[`projectFile_${index}`] ? (
                      <Text className="mt-2 text-sm text-red-500">
                        {errors[`projectFile_${index}`]}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};

export const fundiExperiencePickerOptions = {
  specialization: FUNDI_SPECIALIZATIONS,
  grade: FUNDI_GRADE_OPTIONS,
  experience: FUNDI_EXPERIENCE_OPTIONS,
};

export default Experience;
