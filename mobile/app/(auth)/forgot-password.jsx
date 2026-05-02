import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { COLORS } from '../../utils/colors';
import { postData } from '../../utils/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpwd
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) { Alert.alert('Enter your email'); return; }
    setLoading(true);
    try {
      const res = await postData('/api/user/forgot-password', { email });
      if (res?.error === false) setStep(2);
      else Alert.alert('Error', res?.message || 'Could not send OTP');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!otp || !newPassword) { Alert.alert('Fill in all fields'); return; }
    if (newPassword.length < 6) { Alert.alert('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res1 = await postData('/api/user/verify-forgot-password-otp', { email, otp });
      if (res1?.error !== false) { Alert.alert('Error', res1?.message || 'Invalid OTP'); return; }
      const res2 = await postData('/api/user/reset-password', { email, newPassword });
      if (res2?.error === false) {
        Alert.alert('Password Reset!', 'Your password has been reset.', [
          { text: 'Login', onPress: () => router.replace('/(auth)/login') },
        ]);
      } else {
        Alert.alert('Error', res2?.message || 'Reset failed');
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Forgot Password</Text>

      {step === 1 ? (
        <>
          <Text style={styles.subtitle}>Enter your email and we'll send you a reset code.</Text>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <Button title="Send Reset Code" onPress={handleSendOtp} loading={loading} />
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Enter the OTP sent to {email} and choose a new password.</Text>
          <Input label="OTP Code" value={otp} onChangeText={setOtp} placeholder="6-digit code" keyboardType="number-pad" />
          <Input label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="Min. 6 characters" secureTextEntry />
          <Button title="Reset Password" onPress={handleReset} loading={loading} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 28 },
  backText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 28, lineHeight: 21 },
});
