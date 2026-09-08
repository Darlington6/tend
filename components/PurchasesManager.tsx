import { useEffect, useRef } from 'react';
import Purchases from 'react-native-purchases';
import { useAuthStore } from '../lib/auth-store';
import { useEntitlementsStore } from '../lib/entitlements-store';
import { configurePurchases, linkPurchasesIdentity, unlinkPurchasesIdentity } from '../lib/purchases';

/**
 * Renders nothing. Configures RevenueCat once at launch, keeps the
 * entitlements store in sync with CustomerInfo, and aliases the RevenueCat
 * identity to the signed-in Supabase user so a subscription follows the
 * account across devices rather than staying tied to one device.
 */
export function PurchasesManager() {
  const session = useAuthStore((state) => state.session);
  const setFromCustomerInfo = useEntitlementsStore((state) => state.setFromCustomerInfo);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    configurePurchases();
    Purchases.addCustomerInfoUpdateListener(setFromCustomerInfo);
    Purchases.getCustomerInfo()
      .then(setFromCustomerInfo)
      .catch((error) => console.warn('Failed to load customer info', error));
  }, [setFromCustomerInfo]);

  useEffect(() => {
    const userId = session?.user.id ?? null;
    if (userId === previousUserId.current) return;
    previousUserId.current = userId;

    if (userId) {
      linkPurchasesIdentity(userId).catch((error) =>
        console.warn('Failed to link purchases identity', error)
      );
    } else {
      unlinkPurchasesIdentity().catch((error) =>
        console.warn('Failed to unlink purchases identity', error)
      );
    }
  }, [session]);

  return null;
}
