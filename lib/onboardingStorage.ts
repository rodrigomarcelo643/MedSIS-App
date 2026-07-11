import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "medsis_onboarding_done";

export const hasSeenOnboarding = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(KEY);
  return val === "true";
};

export const markOnboardingDone = async (): Promise<void> => {
  await AsyncStorage.setItem(KEY, "true");
};
