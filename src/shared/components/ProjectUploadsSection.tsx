import React from "react";
import { Pressable, Text, View } from "react-native";
import { ProfileCompletionTextField } from "./ProfileCompletionField";

export type ProjectUploadItem = {
  name: string;
  fileName: string;
};

type ProjectUploadsSectionProps = {
  title: string;
  helperText: string;
  projects: ProjectUploadItem[];
  errors: Record<string, string>;
  onProjectNameChange: (index: number, value: string) => void;
  onProjectFileUpload: (index: number) => void;
};

const ProjectUploadsSection = ({
  title,
  helperText,
  projects,
  errors,
  onProjectNameChange,
  onProjectFileUpload,
}: ProjectUploadsSectionProps) => {
  return (
    <View className="mt-5 rounded-[24px] border border-blue-200 bg-blue-50 px-4 py-4">
      <Text className="text-lg font-semibold text-blue-800">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-blue-700">{helperText}</Text>

      <View className="mt-4 gap-4">
        {projects.map((project, index) => (
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
                <Text className="mb-3 text-[15px] font-medium text-slate-800">Project Files</Text>
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
  );
};

export default ProjectUploadsSection;
