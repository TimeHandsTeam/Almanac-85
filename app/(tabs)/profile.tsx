import { View, Text, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();

  return (
    <ScreenWrapper className="px-4">
      <Text className="text-2xl font-bold text-primary mt-6 mb-2">Profile</Text>
      <Text className="text-muted mb-8">{session?.user?.email}</Text>

      <TouchableOpacity
        className="bg-surface border border-border rounded-xl py-4 items-center"
        onPress={signOut}
      >
        <Text className="text-danger font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
