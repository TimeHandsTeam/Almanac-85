import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ActivityIndicator,
  Pressable, Alert,
} from 'react-native';
import { purchaseCredits, PRODUCT_IDS } from '@/lib/purchases';
import { COLORS, CREDIT_PACKS } from '@/lib/constants';

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
}

interface PurchaseSheetProps {
  onPurchaseComplete: (creditsAdded: number) => void;
}

export const PurchaseSheet = forwardRef<BottomSheetRef, PurchaseSheetProps>(
  ({ onPurchaseComplete }, ref) => {
    const [visible, setVisible] = useState(false);
    const [purchasing, setPurchasing] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }));

    const handlePurchase = async (packId: string, credits: number) => {
      const productId = PRODUCT_IDS[packId as keyof typeof PRODUCT_IDS];
      if (!productId) return;

      setPurchasing(packId);
      const result = await purchaseCredits(productId);
      setPurchasing(null);

      if (result.success) {
        setVisible(false);
        onPurchaseComplete(credits);
      } else if (result.error && result.error !== 'cancelled') {
        Alert.alert('Purchase Failed', result.error);
      }
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-surface rounded-t-3xl px-5 pt-5 pb-10">
              {/* Handle */}
              <View className="w-10 h-1 bg-border rounded-full self-center mb-5" />

              <Text className="text-primary text-xl font-bold mb-1">Buy Credits</Text>
              <Text className="text-muted text-sm mb-5">Each AI prediction costs 1 credit</Text>

              {CREDIT_PACKS.map((pack) => {
                const isLoading = purchasing === pack.id;
                const perCredit = (pack.price / pack.credits).toFixed(2);
                const isBestValue = pack.id === 'pack_200';

                return (
                  <TouchableOpacity
                    key={pack.id}
                    onPress={() => handlePurchase(pack.id, pack.credits)}
                    disabled={purchasing !== null}
                    className="flex-row items-center bg-elevated border border-border rounded-2xl p-4 mb-3"
                    style={isBestValue ? { borderColor: COLORS.gold } : undefined}
                  >
                    {isBestValue && (
                      <View
                        className="absolute -top-2.5 right-4 bg-gold rounded-full px-2 py-0.5"
                      >
                        <Text className="text-background text-xs font-bold">Best Value</Text>
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="text-primary font-bold text-base">{pack.credits} Credits</Text>
                      <Text className="text-muted text-xs mt-0.5">${perCredit} per credit</Text>
                    </View>
                    {isLoading ? (
                      <ActivityIndicator color={COLORS.gold} size="small" />
                    ) : (
                      <View className="bg-gold rounded-xl px-4 py-2">
                        <Text className="text-background font-bold">${pack.price}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              <Text className="text-muted text-xs text-center mt-2">
                Purchases are processed through Apple/Google. Credits never expire.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);
