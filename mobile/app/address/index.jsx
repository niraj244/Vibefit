import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchData, deleteData } from '../../utils/api';
import { COLORS } from '../../utils/colors';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';

export default function AddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetchData('/api/address/get');
      setAddresses(res?.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteData(`/api/address/delete/${id}`);
        await load();
      }},
    ]);
  };

  if (loading) return <Spinner fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Addresses</Text>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No saved addresses</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.addrCard}>
            <View style={styles.addrInfo}>
              <View style={styles.addrTypeRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.addressType}</Text>
                </View>
                {item.selected && <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>Default</Text></View>}
              </View>
              <Text style={styles.addrLine}>{item.address_line1}</Text>
              <Text style={styles.addrLine}>{item.city}, {item.state} {item.pincode}</Text>
              <Text style={styles.addrLine}>{item.mobile}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Button title="Add New Address" onPress={() => router.push('/address/add')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  list: { padding: 16 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.textMuted },
  addrCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  addrInfo: { flex: 1 },
  addrTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  typeBadge: { backgroundColor: COLORS.lightGray, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  defaultBadge: { backgroundColor: '#dcfce7', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  defaultBadgeText: { fontSize: 11, fontWeight: '700', color: '#166534' },
  addrLine: { fontSize: 14, color: COLORS.textLight, marginBottom: 2 },
  deleteBtn: { padding: 4 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
});
