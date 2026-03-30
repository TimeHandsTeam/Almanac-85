import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// RevenueCat API keys — set in app.json extra or via EAS secrets
const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

// Product IDs must match what's configured in RevenueCat dashboard
export const PRODUCT_IDS = {
  pack_10: 'almanac85_credits_10',
  pack_50: 'almanac85_credits_50',
  pack_200: 'almanac85_credits_200',
} as const;

export function initPurchases(userId?: string) {
  const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
  if (!apiKey) return; // Skip in dev without keys

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  Purchases.configure({ apiKey });
  if (userId) {
    Purchases.logIn(userId);
  }
}

export async function purchaseCredits(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { customerInfo, productIdentifier } = await Purchases.purchaseStoreProduct(
      // @ts-ignore — getProducts returns StoreProduct[]
      { identifier: productId }
    );

    if (!customerInfo || !productIdentifier) {
      return { success: false, error: 'Purchase did not complete' };
    }

    // Grant credits server-side
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.functions.invoke('credits', {
      body: { product_id: productId },
    });

    if (error || data?.error) {
      return { success: false, error: (data?.error ?? error?.message) || 'Failed to grant credits' };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // User cancelled — not an error
    if (msg.includes('PURCHASE_CANCELLED') || msg.includes('1')) {
      return { success: false, error: 'cancelled' };
    }
    return { success: false, error: msg };
  }
}
