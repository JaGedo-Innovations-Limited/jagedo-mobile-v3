import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type CompleteProfileStepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

const CompleteProfileStepIndicator = ({
  currentStep,
  totalSteps,
}: CompleteProfileStepIndicatorProps) => {
  return (
    <View className="mb-8 flex-row items-center justify-between">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isLast = stepNumber === totalSteps;

        return (
          <React.Fragment key={`step-${stepNumber}`}>
            <View
              className={`h-10 w-10 items-center justify-center rounded-full border-2 ${
                isCompleted
                  ? "border-violet-600 bg-violet-600"
                  : isActive
                    ? "border-violet-600 bg-white"
                    : "border-slate-300 bg-white"
              }`}
            >
              {isCompleted ? (
                <Feather name="check" size={20} color="#FFFFFF" />
              ) : (
                <View
                  className={`h-3 w-3 rounded-full ${
                    isActive ? "bg-violet-600" : "bg-slate-300"
                  }`}
                />
              )}
            </View>

            {!isLast ? (
              <View className={`mx-2 h-[2px] flex-1 ${stepNumber < currentStep ? "bg-violet-600" : "bg-slate-200"}`} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default CompleteProfileStepIndicator;
