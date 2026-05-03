import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { postData } from '../../utils/api';
import { COLORS } from '../../utils/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';

const ADDRESS_TYPES = ['Home', 'Office'];

export default function AddAddressScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    address_line1: '', city: '', state: '',
    country: 'Nepal', mobile: '', landmark: '', addressType: 'Home',
  });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.address_line1 || !form.city || !form.mobile) {
      Alert.alert('Fill required fields', 'Address, city and mobile are required.');
      return;
    }
    setLoading(true);
    try {
      const res = await postData('/api/address/create', form);
      if (res?.error === false) {
        Alert.alert('Address Saved', '', [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        Alert.alert('Error', res?.message || 'Could not save address');
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Address</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Street Address *" value={form.address_line1} onChangeText={set('address_line1')} placeholder="House no., street, area" autoCapitalize="words" />
        <Input label="Landmark" value={form.landmark} onChangeText={set('landmark')} placeholder="Near landmark (optional)" />
        <Input label="City *" value={form.city} onChangeText={set('city')} placeholder="City" autoCapitalize="words" />
        <Input label="State / Province" value={form.state} onChangeText={set('state')} placeholder="Province" autoCapitalize="words" />
        <Input label="Mobile *" value={form.mobile} onChangeText={set('mobile')} placeholder="+977-98XXXXXXXX" keyboardType="phone-pad" />

        <Text style={styles.typeLabel}>Address Type</Text>
        <View style={styles.typeRow}>
          {ADDRESS_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, form.addressType === t && styles.typeBtnActive]}
              onPress={() => set('addressType')(t)}
            >
              <Ionicons name={t === 'Home' ? 'home-outline' : 'business-outline'} size={18} color={form.addressType === t ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.typeBtnText, form.addressType === t && styles.typeBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Save Address" onPress={handleSave} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  content: { padding: 16, backgroundColor: '#fff', flexGrow: 1 },
  typeLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 10 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10 },
  typeBtnActive: { borderColor: COLORS.primary, backgroundColor: '#fff7ed' },
  typeBtnText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  typeBtnTextActive: { color: COLORS.primary },
});
