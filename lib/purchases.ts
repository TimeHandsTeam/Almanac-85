import { Platform, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

// Lazy-load native module so the app doesn't crash in Expo Go
let _Purchases: typeof import('react-native-purchases').default | null = null;
let _LOG_LEVEL: typeof import('react-native-purchases').LOG_LEVEL | null = null;

function getPurchases() {
  if (_Purchases) return _Purchases;
  try {
    const mod = require('react-native-purchases');
    _Purchases = mod.default ?? mod.Purchases;
    _LOG_LEVEL = mod.LOG_LEVEL;
    return _Purchases;
  } catch {
    return null; // Expo Go — native module unavailable
  }
}

// RevenueCat API keys — set in .env.local
const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

export const PRODUCT_IDS = {
  pack_10: 'almanac85_credits_10',
  pack_50: 'almanac85_credits_50',
  pack_200: 'almanac85_credits_200',
} as const;

export function initPurchases(userId?: string) {
  const Purchases = getPurchases();
  if (!Purchases) return; // Expo Go — skip silently

  const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
  if (!apiKey) return; // No key configured yet

  if (__DEV__ && _LOG_LEVEL) {
    Purchases.setLogLevel(_LOG_LEVEL.DEBUG);
  }
  Purchases.configure({ apiKey });
  if (userId) Purchases.logIn(userId);
}

export async function purchaseCredits(productId: string): Promise<{ success: boolean; error?: string }> {
  const Purchases = getPurchases();

  // In Expo Go or dev without native module — show mock alert
  if (!Purchases) {
    return new Promise((resolve) => {
      Alert.alert(
        'Dev Mode Purchase',
        `In a real build this would charge for "${productId}". Grant 10 free credits for testing?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve({ success: false, error: 'cancelled' }) },
          {
            text: 'Grant Credits',
            onPress: async () => {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) { resolve({ success: false, error: 'Not authenticated' }); return; }
              const { data, error } = await supabase.functions.invoke('credits', {
                body: { product_id: productId },
              });
              if (error || data?.error) {
                resolve({ success: false, error: data?.error ?? error?.message ?? 'Failed' });
              } else {
                resolve({ success: true });
              }
            },
          },
        ]
      );
    });
  }

  try {
    const { customerInfo, productIdentifier } = await Purchases.purchaseStoreProduct(
      // @ts-ignore — runtime typing
      { identifier: productId }
    );

    if (!customerInfo || !productIdentifier) {
      return { success: false, error: 'Purchase did not complete' };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.functions.invoke('credits', {
      body: { product_id: productId },
    });

    if (error || data?.error) {
      return { success: false, error: data?.error ?? error?.message ?? 'Failed to grant credits' };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('PURCHASE_CANCELLED') || msg.includes('1')) {
      return { success: false, error: 'cancelled' };
    }
    return { success: false, error: msg };
  }
}
