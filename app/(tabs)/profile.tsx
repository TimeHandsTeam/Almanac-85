import { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { CreditBadge } from '@/components/ui/CreditBadge';
import { PurchaseSheet } from '@/components/ui/PurchaseSheet';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { CREDIT_PACKS, COLORS } from '@/lib/constants';
import type { BottomSheetRef } from '@/components/ui/PurchaseSheet';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { balance } = useCredits();
  const purchaseSheetRef = useRef<BottomSheetRef>(null);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const email = session?.user?.email ?? '';
  const initials = email ? email[0].toUpperCase() : '?';

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-2xl font-bold text-primary">Profile</Text>
        </View>

        {/* Avatar + email */}
        <View className="items-center px-4 mb-6">
          <View className="w-20 h-20 rounded-full bg-elevated border-2 border-gold items-center justify-center mb-3">
            <Text className="text-gold text-3xl font-bold">{initials}</Text>
          </View>
          <Text className="text-primary font-semibold text-base">{email}</Text>
          <Text className="text-muted text-sm mt-0.5">Member</Text>
        </View>

        {/* Credits section */}
        <View className="mx-4 mb-4 bg-surface border border-border rounded-2xl overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <View>
              <Text className="text-muted text-xs uppercase tracking-wider mb-1">AI Credits</Text>
              <View className="flex-row items-center gap-2">
                <CreditBadge balance={balance} />
                <Text className="text-muted text-sm">remaining</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => purchaseSheetRef.current?.open()}
              className="bg-gold px-4 py-2 rounded-xl"
            >
              <Text className="text-background font-bold text-sm">Buy More</Text>
            </TouchableOpacity>
          </View>

          {/* Pack list */}
          {CREDIT_PACKS.map((pack, i) => (
            <TouchableOpacity
              key={pack.id}
              onPress={() => purchaseSheetRef.current?.open()}
              className={`flex-row items-center p-4 ${i < CREDIT_PACKS.length - 1 ? 'border-b border-border' : ''}`}
            >
              <Text className="text-primary font-semibold flex-1">{pack.label}</Text>
              <Text className="text-gold font-bold">${pack.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* About */}
        <View className="mx-4 mb-4 bg-surface border border-border rounded-2xl overflow-hidden">
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <Text className="text-muted text-xs uppercase tracking-wider">App</Text>
          </View>
          <View className="flex-row items-center p-4 border-b border-border">
            <Text className="text-primary flex-1">Sports Almanac85</Text>
            <Text className="text-muted text-sm">v1.0.0</Text>
          </View>
          <View className="flex-row items-center p-4 border-b border-border">
            <Text className="text-primary flex-1">Sports</Text>
            <Text className="text-muted text-sm">12 supported</Text>
          </View>
          <View className="flex-row items-center p-4">
            <Text className="text-primary flex-1">Data</Text>
            <Text className="text-muted text-sm">ESPN • Real-time</Text>
          </View>
        </View>

        {/* Sign out */}
        <View className="mx-4">
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-surface border border-danger/30 rounded-2xl py-4 items-center"
          >
            <Text className="text-danger font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PurchaseSheet ref={purchaseSheetRef} onPurchaseComplete={() => {}} />
    </ScreenWrapper>
  );
}
