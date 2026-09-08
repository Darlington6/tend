import { create } from 'zustand';
import type { CustomerInfo } from 'react-native-purchases';
import { PREMIUM_ENTITLEMENT_ID } from '../constants/revenuecat';

type EntitlementsState = {
  isPremium: boolean;
  loading: boolean;
  setFromCustomerInfo: (info: CustomerInfo) => void;
};

export const useEntitlementsStore = create<EntitlementsState>((set) => ({
  isPremium: false,
  loading: true,
  setFromCustomerInfo: (info) => {
    set({
      isPremium: typeof info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== 'undefined',
      loading: false,
    });
  },
}));
