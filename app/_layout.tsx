import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { initPurchases } from '@/lib/purchases';
import '../global.css';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'auth';
    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    initPurchases();
  }, []);

  return (
    <AuthGuard>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
      </Stack>
    </AuthGuard>
  );
}
