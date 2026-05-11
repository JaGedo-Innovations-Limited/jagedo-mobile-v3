import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CONTRACTOR_CATEGORY_OPTIONS,
  CONTRACTOR_NCA_CLASS_OPTIONS,
  CONTRACTOR_SPECIALIZATIONS,
  CONTRACTOR_YEARS_OPTIONS,
  FUNDI_EXPERIENCE_OPTIONS,
  FUNDI_GRADE_OPTIONS,
  FUNDI_GRADE_PROJECT_COUNT,
  FUNDI_SKILL_OPTIONS,
  FUNDI_SPECIALIZATIONS,
  PROFESSIONAL_CATEGORY_OPTIONS,
  PROFESSIONAL_LEVEL_OPTIONS,
  PROFESSIONAL_LEVEL_PROJECT_COUNT,
  PROFESSIONAL_SPECIALIZATIONS,
  PROFESSIONAL_YEARS_OPTIONS,
} from "../../../../shared/constants/experience";
import {
  ExperienceSelectionPanel,
  OptionPickerModal,
  ProjectUploadsSection,
//   type ProjectUploadItem,
} from "../../../../shared/components";

type ExperienceProps = {
  userType?: string;
};

type ProjectUploadItem = {
    name: string;
    fileName: string;
};

type PickerType =
  | "fundiSkill"
  | "fundiSpecialization"
  | "fundiGrade"
  | "fundiExperience"
  | "professionalCategory"
  | "professionalSpecialization"
  | "professionalLevel"
  | "professionalExperience"
  | "contractorCategory"
  | "contractorSpecialization"
  | "contractorClass"
  | "contractorYears"
  | null;

type ContractorCategoryEntry = {
  id: number;
  category: string;
  specialization: string;
  ncaClass: string;
  years: string;
};

type ContractorProjectEntry = {
  categoryId: number;
  category: string;
  projectName: string;
  projectFileName: string;
  referenceLetterName: string;
};

const createProjectUploads = (count: number): ProjectUploadItem[] =>
  Array.from({ length: count }, () => ({ name: "", fileName: "" }));

const createContractorCategory = (id: number): ContractorCategoryEntry => ({
  id,
  category: "",
  specialization: "",
  ncaClass: "",
  years: "",
});

const Experience = ({ userType = "Fundi" }: ExperienceProps) => {
  const [openPicker, setOpenPicker] = useState<PickerType>(null);
  const [activeContractorCategoryId, setActiveContractorCategoryId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [fundiSkill, setFundiSkill] = useState("");
  const [fundiSpecialization, setFundiSpecialization] = useState("");
  const [fundiGrade, setFundiGrade] = useState("");
  const [fundiExperience, setFundiExperience] = useState("");
  const [fundiProjects, setFundiProjects] = useState<ProjectUploadItem[]>([]);

  const [professionalCategory, setProfessionalCategory] = useState("");
  const [professionalSpecialization, setProfessionalSpecialization] = useState("");
  const [professionalLevel, setProfessionalLevel] = useState("");
  const [professionalExperience, setProfessionalExperience] = useState("");
  const [professionalProjects, setProfessionalProjects] = useState<ProjectUploadItem[]>([]);

  const [contractorCategories, setContractorCategories] = useState<ContractorCategoryEntry[]>([
    createContractorCategory(1),
  ]);
  const [contractorProjects, setContractorProjects] = useState<ContractorProjectEntry[]>([]);

  const titleMap: Record<string, string> = {
    Fundi: "Fundi Experience",
    Professional: "Professional Experience",
    Contractor: "Contractor Experience",
    Hardware: "Hardware Experience",
  };

  const fundiSpecializationOptions = useMemo(
    () => FUNDI_SPECIALIZATIONS[fundiSkill as keyof typeof FUNDI_SPECIALIZATIONS] || [],
    [fundiSkill],
  );

  const professionalSpecializationOptions = useMemo(
    () =>
      PROFESSIONAL_SPECIALIZATIONS[
        professionalCategory as keyof typeof PROFESSIONAL_SPECIALIZATIONS
      ] || [],
    [professionalCategory],
  );

  const activeContractorCategory = contractorCategories.find(
    (entry) => entry.id === activeContractorCategoryId,
  );

  const contractorSpecializationOptions =
    CONTRACTOR_SPECIALIZATIONS[
      (activeContractorCategory?.category || "") as keyof typeof CONTRACTOR_SPECIALIZATIONS
    ] || [];

  const syncContractorProject = (categoryId: number, category: string) => {
    setContractorProjects((current) => {
      const remaining = current.filter((project) => project.categoryId !== categoryId);

      if (!category) {
        return remaining;
      }

      return [
        ...remaining,
        {
          categoryId,
          category,
          projectName: `${category} - Project 1`,
          projectFileName: "",
          referenceLetterName: "",
        },
      ];
    });
  };

  const updateContractorCategory = (
    categoryId: number,
    updater: (entry: ContractorCategoryEntry) => ContractorCategoryEntry,
  ) => {
    setContractorCategories((current) =>
      current.map((entry) => (entry.id === categoryId ? updater(entry) : entry)),
    );
  };

  const validateFundi = () => {
    const nextErrors: Record<string, string> = {};

    if (!fundiSkill) nextErrors.fundiSkill = "Select a skill.";
    if (!fundiSpecialization) nextErrors.fundiSpecialization = "Select a specialization.";
    if (!fundiGrade) nextErrors.fundiGrade = "Select a grade.";
    if (!fundiExperience) nextErrors.fundiExperience = "Select experience.";

    const requiredProjects = FUNDI_GRADE_PROJECT_COUNT[fundiGrade] ?? 0;
    fundiProjects.slice(0, requiredProjects).forEach((project, index) => {
      if (!project.name.trim()) nextErrors[`fundiProjectName_${index}`] = "Project name is required.";
      if (!project.fileName.trim()) nextErrors[`fundiProjectFile_${index}`] = "Upload a project file.";
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateProfessional = () => {
    const nextErrors: Record<string, string> = {};

    if (!professionalCategory) nextErrors.professionalCategory = "Select a category.";
    if (!professionalSpecialization) {
      nextErrors.professionalSpecialization = "Select a specialization.";
    }
    if (!professionalLevel) nextErrors.professionalLevel = "Select a level.";
    if (!professionalExperience) {
      nextErrors.professionalExperience = "Select years of experience.";
    }

    const requiredProjects = PROFESSIONAL_LEVEL_PROJECT_COUNT[professionalLevel] ?? 0;
    professionalProjects.slice(0, requiredProjects).forEach((project, index) => {
      if (!project.name.trim()) {
        nextErrors[`professionalProjectName_${index}`] = "Project name is required.";
      }
      if (!project.fileName.trim()) {
        nextErrors[`professionalProjectFile_${index}`] = "Upload a project file.";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateContractor = () => {
    const nextErrors: Record<string, string> = {};

    contractorCategories.forEach((entry) => {
      if (!entry.category) nextErrors[`contractorCategory_${entry.id}`] = "Select a category.";
      if (!entry.specialization) {
        nextErrors[`contractorSpecialization_${entry.id}`] = "Select a specialization.";
      }
      if (!entry.ncaClass) nextErrors[`contractorClass_${entry.id}`] = "Select an NCA class.";
      if (!entry.years) nextErrors[`contractorYears_${entry.id}`] = "Select years of experience.";
    });

    contractorProjects.forEach((project) => {
      if (!project.projectFileName) {
        nextErrors[`contractorProjectFile_${project.categoryId}`] = "Upload a project file.";
      }
      if (!project.referenceLetterName) {
        nextErrors[`contractorReference_${project.categoryId}`] = "Upload a reference letter.";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (userType === "Fundi") {
      validateFundi();
      return;
    }

    if (userType === "Professional") {
      validateProfessional();
      return;
    }

    if (userType === "Contractor") {
      validateContractor();
      return;
    }

    setErrors({});
  };

  const pickerConfig = (() => {
    switch (openPicker) {
      case "fundiSkill":
        return {
          title: "Select skill",
          options: FUNDI_SKILL_OPTIONS,
          onSelect: (value: string) => {
            setFundiSkill(value);
            setFundiSpecialization("");
            setErrors((current) => ({
              ...current,
              fundiSkill: "",
              fundiSpecialization: "",
            }));
            setOpenPicker(null);
          },
        };
      case "fundiSpecialization":
        return {
          title: "Select specialization",
          options: fundiSpecializationOptions,
          onSelect: (value: string) => {
            setFundiSpecialization(value);
            setErrors((current) => ({ ...current, fundiSpecialization: "" }));
            setOpenPicker(null);
          },
        };
      case "fundiGrade":
        return {
          title: "Select grade",
          options: FUNDI_GRADE_OPTIONS,
          onSelect: (value: string) => {
            setFundiGrade(value);
            setFundiProjects(createProjectUploads(FUNDI_GRADE_PROJECT_COUNT[value] ?? 0));
            setErrors((current) => ({ ...current, fundiGrade: "" }));
            setOpenPicker(null);
          },
        };
      case "fundiExperience":
        return {
          title: "Select experience",
          options: FUNDI_EXPERIENCE_OPTIONS,
          onSelect: (value: string) => {
            setFundiExperience(value);
            setErrors((current) => ({ ...current, fundiExperience: "" }));
            setOpenPicker(null);
          },
        };
      case "professionalCategory":
        return {
          title: "Select category",
          options: PROFESSIONAL_CATEGORY_OPTIONS,
          onSelect: (value: string) => {
            setProfessionalCategory(value);
            setProfessionalSpecialization("");
            setErrors((current) => ({
              ...current,
              professionalCategory: "",
              professionalSpecialization: "",
            }));
            setOpenPicker(null);
          },
        };
      case "professionalSpecialization":
        return {
          title: "Select specialization",
          options: professionalSpecializationOptions,
          onSelect: (value: string) => {
            setProfessionalSpecialization(value);
            setErrors((current) => ({ ...current, professionalSpecialization: "" }));
            setOpenPicker(null);
          },
        };
      case "professionalLevel":
        return {
          title: "Select level",
          options: PROFESSIONAL_LEVEL_OPTIONS,
          onSelect: (value: string) => {
            setProfessionalLevel(value);
            setProfessionalProjects(createProjectUploads(PROFESSIONAL_LEVEL_PROJECT_COUNT[value] ?? 0));
            setErrors((current) => ({ ...current, professionalLevel: "" }));
            setOpenPicker(null);
          },
        };
      case "professionalExperience":
        return {
          title: "Select experience",
          options: PROFESSIONAL_YEARS_OPTIONS,
          onSelect: (value: string) => {
            setProfessionalExperience(value);
            setErrors((current) => ({ ...current, professionalExperience: "" }));
            setOpenPicker(null);
          },
        };
      case "contractorCategory": {
        const selectedCategories = contractorCategories
          .filter((entry) => entry.id !== activeContractorCategoryId)
          .map((entry) => entry.category)
          .filter(Boolean);

        return {
          title: "Select category",
          options: CONTRACTOR_CATEGORY_OPTIONS.filter(
            (option) => !selectedCategories.includes(option),
          ),
          onSelect: (value: string) => {
            if (activeContractorCategoryId === null) {
              return;
            }

            updateContractorCategory(activeContractorCategoryId, (entry) => ({
              ...entry,
              category: value,
              specialization: "",
            }));
            syncContractorProject(activeContractorCategoryId, value);
            setErrors((current) => ({
              ...current,
              [`contractorCategory_${activeContractorCategoryId}`]: "",
              [`contractorSpecialization_${activeContractorCategoryId}`]: "",
            }));
            setOpenPicker(null);
          },
        };
      }
      case "contractorSpecialization":
        return {
          title: "Select specialization",
          options: contractorSpecializationOptions,
          onSelect: (value: string) => {
            if (activeContractorCategoryId === null) {
              return;
            }

            updateContractorCategory(activeContractorCategoryId, (entry) => ({
              ...entry,
              specialization: value,
            }));
            setErrors((current) => ({
              ...current,
              [`contractorSpecialization_${activeContractorCategoryId}`]: "",
            }));
            setOpenPicker(null);
          },
        };
      case "contractorClass":
        return {
          title: "Select class",
          options: CONTRACTOR_NCA_CLASS_OPTIONS,
          onSelect: (value: string) => {
            if (activeContractorCategoryId === null) {
              return;
            }

            updateContractorCategory(activeContractorCategoryId, (entry) => ({
              ...entry,
              ncaClass: value,
            }));
            setErrors((current) => ({
              ...current,
              [`contractorClass_${activeContractorCategoryId}`]: "",
            }));
            setOpenPicker(null);
          },
        };
      case "contractorYears":
        return {
          title: "Select years",
          options: CONTRACTOR_YEARS_OPTIONS,
          onSelect: (value: string) => {
            if (activeContractorCategoryId === null) {
              return;
            }

            updateContractorCategory(activeContractorCategoryId, (entry) => ({
              ...entry,
              years: value,
            }));
            setErrors((current) => ({
              ...current,
              [`contractorYears_${activeContractorCategoryId}`]: "",
            }));
            setOpenPicker(null);
          },
        };
      default:
        return null;
    }
  })();

  const renderFundi = () => (
    <View>
      <View className="mb-5 rounded-[24px] border border-blue-200 bg-blue-50 px-4 py-4">
        <Text className="text-lg font-semibold text-blue-800">Next Steps</Text>
        <Text className="mt-3 text-sm leading-6 text-blue-700">
          - You will attend a <Text className="font-semibold">15-minute interview</Text> after submission.
        </Text>
        <Text className="mt-2 text-sm leading-6 text-blue-700">
          - Verification typically takes between <Text className="font-semibold">7 to 14 days</Text> based on your work review.
        </Text>
      </View>

      <ExperienceSelectionPanel
        primaryLabel="Skill"
        primaryValue={fundiSkill}
        primaryPlaceholder="Select skill"
        onOpenPrimary={() => setOpenPicker("fundiSkill")}
        secondaryLabel="Specialization"
        secondaryValue={fundiSpecialization}
        secondaryPlaceholder={fundiSkill ? "Select specialization" : "Select skill first"}
        onOpenSecondary={() => setOpenPicker("fundiSpecialization")}
        tertiaryLabel="Grade"
        tertiaryValue={fundiGrade}
        tertiaryPlaceholder="Select grade"
        onOpenTertiary={() => setOpenPicker("fundiGrade")}
        quaternaryLabel="Experience"
        quaternaryValue={fundiExperience}
        quaternaryPlaceholder="Select experience"
        onOpenQuaternary={() => setOpenPicker("fundiExperience")}
        errors={errors}
        primaryErrorKey="fundiSkill"
        secondaryErrorKey="fundiSpecialization"
        tertiaryErrorKey="fundiGrade"
        quaternaryErrorKey="fundiExperience"
      />

      {fundiProjects.length > 0 ? (
        <ProjectUploadsSection
          title={`Add Missing Projects (${fundiProjects.length} remaining)`}
          helperText="Add projects to complete your experience profile."
          projects={fundiProjects}
          errors={Object.fromEntries(
            Object.entries(errors).map(([key, value]) => [
              key.replace("fundiProjectName_", "projectName_").replace("fundiProjectFile_", "projectFile_"),
              value,
            ]),
          )}
          onProjectNameChange={(index, value) => {
            setFundiProjects((current) =>
              current.map((project, projectIndex) =>
                projectIndex === index ? { ...project, name: value } : project,
              ),
            );
          }}
          onProjectFileUpload={(index) => {
            setFundiProjects((current) =>
              current.map((project, projectIndex) =>
                projectIndex === index
                  ? { ...project, fileName: `fundi-project-${index + 1}.pdf` }
                  : project,
              ),
            );
          }}
        />
      ) : null}

      <Pressable
        className="mt-5 self-end rounded-2xl bg-blue-700 px-5 py-4 active:opacity-90"
        onPress={handleSubmit}
      >
        <Text className="text-base font-semibold text-white">Submit Experience</Text>
      </Pressable>
    </View>
  );

  const renderProfessional = () => (
    <View>
      <ExperienceSelectionPanel
        primaryLabel="Category"
        primaryValue={professionalCategory}
        primaryPlaceholder="Select category"
        onOpenPrimary={() => setOpenPicker("professionalCategory")}
        secondaryLabel="Specialization"
        secondaryValue={professionalSpecialization}
        secondaryPlaceholder={professionalCategory ? "Select specialization" : "Select category first"}
        onOpenSecondary={() => setOpenPicker("professionalSpecialization")}
        tertiaryLabel="Level"
        tertiaryValue={professionalLevel}
        tertiaryPlaceholder="Select level"
        onOpenTertiary={() => setOpenPicker("professionalLevel")}
        quaternaryLabel="Years of Experience"
        quaternaryValue={professionalExperience}
        quaternaryPlaceholder="Select experience"
        onOpenQuaternary={() => setOpenPicker("professionalExperience")}
        errors={errors}
        primaryErrorKey="professionalCategory"
        secondaryErrorKey="professionalSpecialization"
        tertiaryErrorKey="professionalLevel"
        quaternaryErrorKey="professionalExperience"
      />

      {professionalProjects.length > 0 ? (
        <ProjectUploadsSection
          title={`Add Missing Projects (${professionalProjects.length} remaining)`}
          helperText="Add portfolio projects to complete your professional experience profile."
          projects={professionalProjects}
          errors={Object.fromEntries(
            Object.entries(errors).map(([key, value]) => [
              key
                .replace("professionalProjectName_", "projectName_")
                .replace("professionalProjectFile_", "projectFile_"),
              value,
            ]),
          )}
          onProjectNameChange={(index, value) => {
            setProfessionalProjects((current) =>
              current.map((project, projectIndex) =>
                projectIndex === index ? { ...project, name: value } : project,
              ),
            );
          }}
          onProjectFileUpload={(index) => {
            setProfessionalProjects((current) =>
              current.map((project, projectIndex) =>
                projectIndex === index
                  ? { ...project, fileName: `professional-project-${index + 1}.pdf` }
                  : project,
              ),
            );
          }}
        />
      ) : null}

      <Pressable
        className="mt-5 self-end rounded-2xl bg-blue-700 px-5 py-4 active:opacity-90"
        onPress={handleSubmit}
      >
        <Text className="text-base font-semibold text-white">Submit Experience</Text>
      </Pressable>
    </View>
  );

  const renderContractorProjects = () => (
    <View className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4">
      <Text className="text-[28px] font-bold text-slate-950">{titleMap[userType] || "Experience"}</Text>
      <Text className="mt-6 text-2xl font-semibold text-slate-950">Trade Categories</Text>

      <View className="mt-5 gap-5">
        {contractorCategories.map((entry, index) => (
          <View key={entry.id} className="rounded-[24px] bg-slate-50 p-4">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">Category {index + 1}</Text>
              {contractorCategories.length > 1 ? (
                <Pressable
                  className="h-10 w-10 items-center justify-center rounded-full active:bg-red-50"
                  onPress={() => {
                    setContractorCategories((current) =>
                      current.filter((item) => item.id !== entry.id),
                    );
                    setContractorProjects((current) =>
                      current.filter((item) => item.categoryId !== entry.id),
                    );
                  }}
                >
                  <Feather name="trash-2" size={18} color="#EF4444" />
                </Pressable>
              ) : null}
            </View>

            <ExperienceSelectionPanel
              primaryLabel="Category"
              primaryValue={entry.category}
              primaryPlaceholder="Select category"
              onOpenPrimary={() => {
                setActiveContractorCategoryId(entry.id);
                setOpenPicker("contractorCategory");
              }}
              secondaryLabel="Specialization"
              secondaryValue={entry.specialization}
              secondaryPlaceholder={entry.category ? "Select specialization" : "Select category first"}
              onOpenSecondary={() => {
                setActiveContractorCategoryId(entry.id);
                setOpenPicker("contractorSpecialization");
              }}
              tertiaryLabel="NCA Class"
              tertiaryValue={entry.ncaClass}
              tertiaryPlaceholder="Select class"
              onOpenTertiary={() => {
                setActiveContractorCategoryId(entry.id);
                setOpenPicker("contractorClass");
              }}
              quaternaryLabel="Years of Experience"
              quaternaryValue={entry.years}
              quaternaryPlaceholder="Select years"
              onOpenQuaternary={() => {
                setActiveContractorCategoryId(entry.id);
                setOpenPicker("contractorYears");
              }}
              errors={errors}
              primaryErrorKey={`contractorCategory_${entry.id}`}
              secondaryErrorKey={`contractorSpecialization_${entry.id}`}
              tertiaryErrorKey={`contractorClass_${entry.id}`}
              quaternaryErrorKey={`contractorYears_${entry.id}`}
            />
          </View>
        ))}
      </View>

      <Pressable
        className="mt-5 flex-row items-center gap-3 self-start rounded-2xl px-1 py-2 active:bg-slate-100"
        onPress={() => {
          setContractorCategories((current) => [...current, createContractorCategory(Date.now())]);
        }}
      >
        <Feather name="plus" size={20} color="#4F46E5" />
        <Text className="text-lg font-semibold text-violet-600">Add Category</Text>
      </Pressable>

      <View className="mt-7">
        <Text className="text-2xl font-semibold text-slate-950">Projects (Auto per Category)</Text>
        <Text className="mt-3 text-sm leading-6 text-slate-500">
          Accepted documents include either a Local Purchase Order (LPO), Award Letter, or Completion Certificate.
        </Text>

        <View className="mt-5 gap-4">
          {contractorProjects.map((project) => (
            <View key={project.categoryId} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <Text className="mb-4 text-lg font-semibold text-slate-900">{project.category}</Text>

              <View className="gap-4">
                <View>
                  <Text className="mb-3 text-[15px] font-medium text-slate-800">Project Name</Text>
                  <View className="rounded-2xl border border-slate-300 bg-slate-200 px-4 py-4">
                    <Text className="text-base text-slate-700">{project.projectName}</Text>
                  </View>
                </View>

                <View>
                  <Text className="mb-3 text-[15px] font-medium text-slate-800">Project File</Text>
                  <Pressable
                    className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-4 py-4"
                    onPress={() => {
                      setContractorProjects((current) =>
                        current.map((entry) =>
                          entry.categoryId === project.categoryId
                            ? { ...entry, projectFileName: `${entry.category}-project-file.pdf` }
                            : entry,
                        ),
                      );
                    }}
                  >
                    <Text className="text-base font-medium text-blue-600">
                      {project.projectFileName || "Choose File"}
                    </Text>
                  </Pressable>
                  <Text className="mt-3 text-xs leading-5 text-slate-500">
                    Supported formats: PDF, JPG/JPEG, CSV, XLS/XLSX, MP4 video (max 10 MB).
                  </Text>
                  {errors[`contractorProjectFile_${project.categoryId}`] ? (
                    <Text className="mt-2 text-sm text-red-500">
                      {errors[`contractorProjectFile_${project.categoryId}`]}
                    </Text>
                  ) : null}
                </View>

                <View>
                  <Text className="mb-3 text-[15px] font-medium text-slate-800">Reference Letter</Text>
                  <Pressable
                    className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 px-4 py-4"
                    onPress={() => {
                      setContractorProjects((current) =>
                        current.map((entry) =>
                          entry.categoryId === project.categoryId
                            ? {
                                ...entry,
                                referenceLetterName: `${entry.category}-reference-letter.pdf`,
                              }
                            : entry,
                        ),
                      );
                    }}
                  >
                    <Text className="text-base font-medium text-blue-600">
                      {project.referenceLetterName || "Choose File"}
                    </Text>
                  </Pressable>
                  <Text className="mt-3 text-xs leading-5 text-slate-500">
                    Supported formats: PDF, JPG/JPEG, CSV, XLS/XLSX, MP4 video (max 10 MB).
                  </Text>
                  {errors[`contractorReference_${project.categoryId}`] ? (
                    <Text className="mt-2 text-sm text-red-500">
                      {errors[`contractorReference_${project.categoryId}`]}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        className="mt-6 self-end rounded-2xl bg-blue-700 px-5 py-4 active:opacity-90"
        onPress={handleSubmit}
      >
        <Text className="text-base font-semibold text-white">Submit Experience</Text>
      </Pressable>
    </View>
  );

  if (userType === "Hardware") {
    return (
      <View className="rounded-[28px] border border-slate-200 bg-white p-5">
        <Text className="text-[28px] font-bold text-slate-950">Hardware Experience</Text>
        <Text className="mt-3 text-sm leading-6 text-slate-500">
          Hardware-specific experience fields will be introduced next. The shared profile flow is ready for it.
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="rounded-[28px] border border-slate-200 bg-white p-5">
        {userType === "Contractor" ? (
          renderContractorProjects()
        ) : (
          <>
            <Text className="text-[28px] font-bold text-slate-950">
              {titleMap[userType] || "Experience"}
            </Text>
            <View className="mt-6">
              {userType === "Professional" ? renderProfessional() : renderFundi()}
            </View>
          </>
        )}
      </View>

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

export default Experience;
