import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session/providers/google';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';
import { postData } from '../../utils/api';
import { saveToken } from '../../utils/storage';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, setIsLogin, setUserData, loadCart, loadWishlist } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSuccess(response.authentication.accessToken);
    }
  }, [response]);

  const handleGoogleSuccess = async (accessToken) => {
    try {
      const profileRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profile = await profileRes.json();
      const res = await postData('/api/user/authWithGoogle', {
        name: profile.name,
        email: profile.email,
        avatar: profile.picture,
        mobile: '',
      });
      if (res?.accesstoken) {
        await saveToken('accessToken', res.accesstoken);
        await saveToken('refreshToken', res.refreshToken || '');
        setUserData(res.userData);
        setIsLogin(true);
        await loadCart();
        await loadWishlist();
        router.replace('/(tabs)');
      }
    } catch (e) {
      Alert.alert('Google Sign-In Failed', e.message);
    }
  };

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.error) {
        Alert.alert('Login Failed', res.message || 'Invalid credentials');
      } else if (res?.accesstoken) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', res?.message || 'Something went wrong');
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>VF</Text>
          </View>
          <Text style={styles.brand}>VibeFit</Text>
          <Text style={styles.tagline}>Welcome back! Sign in to continue.</Text>
        </View>

        <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" error={errors.email} />
        <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry error={errors.password} />

        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotWrap}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.btn} />

        <View style={styles.dividerRow}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>OR</Text>
          <View style={styles.divLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn} onPress={() => promptAsync()} disabled={!request}>
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 60 },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  brand: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  tagline: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  btn: { marginBottom: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  divText: { marginHorizontal: 12, color: COLORS.textMuted, fontSize: 13 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 14, marginBottom: 28,
  },
  googleText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { color: COLORS.textMuted, fontSize: 14 },
  signupLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
