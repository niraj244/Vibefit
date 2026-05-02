import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { postData } from '../../utils/api';
import { COLORS } from '../../utils/colors';
import Button from '../../components/Button';

const RETURN_REASONS = [
  'Wrong item received',
  'Item damaged / defective',
  'Item not as described',
  'Changed my mind',
  'Size doesn\'t fit',
  'Other',
];

export default function ReturnRequestScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) { Alert.alert('Select a reason'); return; }
    setLoading(true);
    try {
      const res = await postData(`/api/order/${orderId}/return-request`, {
        returnReason: selectedReason,
        returnNote: note,
      });
      if (res?.error === false) {
        Alert.alert('Return Requested', 'Your return request has been submitted. We\'ll review it shortly.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', res?.message || 'Could not submit return request');
      }
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Request Return</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Why are you returning this order?</Text>
        {RETURN_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason}
            style={[styles.option, selectedReason === reason && styles.optionActive]}
            onPress={() => setSelectedReason(reason)}
          >
            <View style={styles.radio}>
              {selectedReason === reason && <View style={styles.radioFill} />}
            </View>
            <Text style={[styles.optionText, selectedReason === reason && styles.optionTextActive]}>{reason}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Additional Notes (optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Describe the issue in more detail..."
          placeholderTextColor={COLORS.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Button title="Submit Return Request" onPress={handleSubmit} loading={loading} style={{ marginTop: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  content: { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.border },
  optionActive: { borderColor: COLORS.primary, backgroundColor: '#fff7ed' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  radioFill: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  optionText: { fontSize: 14, color: COLORS.text },
  optionTextActive: { color: COLORS.primary, fontWeight: '600' },
  noteInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text, minHeight: 100 },
});
