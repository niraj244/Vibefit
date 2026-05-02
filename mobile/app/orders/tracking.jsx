import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { fetchData } from '../../utils/api';
import { COLORS } from '../../utils/colors';
import Badge from '../../components/Badge';

export default function TrackingScreen() {
  const router = useRouter();
  const { orderId, consignmentId } = useLocalSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTracking = async () => {
    try {
      const res = await fetchData(`/api/order/${orderId}/pathao-tracking`);
      setStatus(res?.data);
    } catch (e) {
      if (!status) setStatus({ error: true });
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { if (orderId) loadTracking(); }, [orderId]);

  const copyId = async () => {
    await Clipboard.setStringAsync(consignmentId);
    Alert.alert('Copied', 'Tracking ID copied to clipboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pathao Tracking</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Consignment ID</Text>
        <View style={styles.idRow}>
          <Text style={styles.id}>{consignmentId}</Text>
          <TouchableOpacity onPress={copyId} style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : status?.error ? (
          <Text style={styles.errorText}>Could not load live status. Check Pathao app for updates.</Text>
        ) : status?.status ? (
          <View style={styles.statusWrap}>
            <Text style={styles.label}>Current Status</Text>
            <Badge label={status.status} variant="primary" />
            {status.lastUpdated && (
              <Text style={styles.updatedText}>Updated: {new Date(status.lastUpdated).toLocaleString()}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.errorText}>No live tracking data yet. Check back after dispatch.</Text>
        )}

        <TouchableOpacity onPress={() => { setRefreshing(true); loadTracking(); }} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
          <Text style={styles.refreshText}>{refreshing ? 'Refreshing...' : 'Refresh Status'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  card: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 6 },
  idRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  id: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  copyBtn: { padding: 6 },
  statusWrap: { marginBottom: 12 },
  updatedText: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  errorText: { fontSize: 14, color: COLORS.textMuted, marginBottom: 12, lineHeight: 20 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, alignSelf: 'flex-start' },
  refreshText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
});
