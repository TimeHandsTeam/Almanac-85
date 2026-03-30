import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/hooks/useAuth';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!email || !password) return;
    if (password.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(email, password);
    setSubmitting(false);
    if (error) {
      Alert.alert('Signup failed', error.message);
    } else {
      Alert.alert('Check your email', 'We sent you a confirmation link. You get 2 free prediction credits!');
    }
  };

  return (
    <ScreenWrapper className="px-6 justify-center">
      <Text className="text-4xl font-bold text-primary mb-2">Sports</Text>
      <Text className="text-4xl font-bold text-gold mb-4">Almanac85</Text>
      <Text className="text-muted mb-12">Create an account and get 2 free AI predictions</Text>

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
        placeholder="Password (min 6 characters)"
        placeholderTextColor="#8A8A8A"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-gold rounded-xl py-4 items-center mb-4"
        onPress={handleSignup}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#0A0A0A" />
          : <Text className="text-background font-bold text-base">Create Account</Text>
        }
      </TouchableOpacity>

      <Link href="/auth/login" asChild>
        <TouchableOpacity className="items-center py-2">
          <Text className="text-muted">Already have an account? <Text className="text-gold">Sign in</Text></Text>
        </TouchableOpacity>
      </Link>
    </ScreenWrapper>
  );
}
