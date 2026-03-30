import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) Alert.alert('Login failed', error.message);
  };

  return (
    <ScreenWrapper className="px-6 justify-center">
      <Text className="text-4xl font-bold text-primary mb-2">Sports</Text>
      <Text className="text-4xl font-bold text-gold mb-12">Almanac85</Text>

      <TextInput
        className="bg-surface border border-border rounded-xl px-4 py-4 text-primary mb-4"
        placeholder="Email"
        placeholderTextColor="#8A8A8A"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="bg-surface border border-border rounded-xl px-4 py-4 text-primary mb-6"
        placeholder="Password"
        placeholderTextColor="#8A8A8A"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-gold rounded-xl py-4 items-center mb-4"
        onPress={handleLogin}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#0A0A0A" />
          : <Text className="text-background font-bold text-base">Sign In</Text>
        }
      </TouchableOpacity>

      <Link href="/auth/signup" asChild>
        <TouchableOpacity className="items-center py-2">
          <Text className="text-muted">Don't have an account? <Text className="text-gold">Sign up</Text></Text>
        </TouchableOpacity>
      </Link>
    </ScreenWrapper>
  );
}
