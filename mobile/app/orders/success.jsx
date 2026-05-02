import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/colors';
import Button from '../../components/Button';

export default function OrderSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={96} color={COLORS.success} />
      </View>
      <Text style={styles.title}>Order Placed!</Text>
      <Text style={styles.subtitle}>
        Thank you for your order. You'll receive a confirmation email shortly.
      </Text>
      <Button title="Track My Orders" onPress={() => router.replace('/orders')} style={styles.btn} />
      <Button
        title="Continue Shopping"
        onPress={() => router.replace('/(tabs)')}
        variant="outline"
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  iconWrap: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  btn: { width: '100%', marginBottom: 12 },
});
