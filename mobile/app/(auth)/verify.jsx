import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '../../components/Button';
import { COLORS } from '../../utils/colors';
import { postData } from '../../utils/api';

export default function VerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (e, idx) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { Alert.alert('Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await postData('/api/user/verifyEmail', { email, otp: code });
      if (res?.error === false) {
        Alert.alert('Verified!', 'Your email has been verified. Please log in.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') },
        ]);
      } else {
        Alert.alert('Verification Failed', res?.message || 'Invalid OTP');
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await postData('/api/user/resend-otp', { email });
      Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
    } catch {
      Alert.alert('Error', 'Could not resend OTP. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {'\n'}<Text style={styles.email}>{email}</Text></Text>

      <View style={styles.otpRow}>
        {otp.map((digit, i) => (
          <TextInput
            key={i}
            ref={(r) => (inputs.current[i] = r)}
            style={[styles.otpInput, digit && styles.otpFilled]}
            value={digit}
            onChangeText={(v) => handleChange(v, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
          />
        ))}
      </View>

      <Button title="Verify" onPress={handleVerify} loading={loading} style={styles.btn} />

      <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.resendWrap}>
        <Text style={styles.resendText}>{resending ? 'Resending...' : "Didn't receive it? Resend OTP"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  subtitle: { fontSize: 15, color: COLORS.textMuted, marginBottom: 36, lineHeight: 22 },
  email: { color: COLORS.text, fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  otpInput: {
    width: 48, height: 56, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 10, fontSize: 22, fontWeight: '700', color: COLORS.text,
  },
  otpFilled: { borderColor: COLORS.primary, backgroundColor: '#fff7ed' },
  btn: { marginBottom: 20 },
  resendWrap: { alignItems: 'center' },
  resendText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
