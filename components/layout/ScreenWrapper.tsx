import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

interface ScreenWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ScreenWrapper({ children, className = '' }: ScreenWrapperProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className={`flex-1 ${className}`}>
        {children}
      </View>
    </SafeAreaView>
  );
}
