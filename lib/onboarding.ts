import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'tend:hasCompletedOnboarding';

export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}
