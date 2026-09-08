import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

let configured = false;

export function configurePurchases() {
  if (configured) return;
  const apiKey = Platform.select({ ios: iosApiKey, android: androidApiKey });

  if (!apiKey) {
    console.warn(
      'Missing EXPO_PUBLIC_REVENUECAT_IOS_API_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY. ' +
        'Purchases will not work until these are set in .env.'
    );
    return;
  }

  Purchases.configure({ apiKey });
  configured = true;
}

export async function linkPurchasesIdentity(userId: string) {
  if (!configured) return;
  await Purchases.logIn(userId);
}

export async function unlinkPurchasesIdentity() {
  if (!configured) return;
  await Purchases.logOut();
}
