import { View, Text } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function NewsScreen() {
  return (
    <ScreenWrapper className="px-4">
      <Text className="text-2xl font-bold text-primary mt-6 mb-2">News</Text>
      <Text className="text-muted">Articles coming in Phase 2</Text>
    </ScreenWrapper>
  );
}
