import { View, Text } from 'react-native';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function PredictScreen() {
  return (
    <ScreenWrapper className="px-4">
      <Text className="text-2xl font-bold text-primary mt-6 mb-2">📈🧮 Predict</Text>
      <Text className="text-muted">AI calculator coming in Phase 3</Text>
    </ScreenWrapper>
  );
}
