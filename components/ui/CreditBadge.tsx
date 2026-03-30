import { View, Text } from 'react-native';

interface CreditBadgeProps { balance: number; }

export function CreditBadge({ balance }: CreditBadgeProps) {
  return (
    <View className="flex-row items-center bg-surface border border-gold rounded-full px-3 py-1">
      <Text className="text-gold text-xs mr-1">📈</Text>
      <Text className="text-gold font-bold text-sm">{String(balance)}</Text>
    </View>
  );
}
