import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchData } from '../../utils/api';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';
import OrderCard from '../../components/OrderCard';
import Spinner from '../../components/Spinner';
import Button from '../../components/Button';

export default function OrdersScreen() {
  const router = useRouter();
  const { isLogin } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await fetchData('/api/order/order-list/orders');
      setOrders(res?.data || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { if (isLogin) loadOrders(); else setLoading(false); }, [isLogin]);

  if (!isLogin) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bag-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Sign in to view your orders</Text>
        <Button title="Sign In" onPress={() => router.push('/(auth)/login')} style={{ width: 160 }} />
      </View>
    );
  }

  if (loading) return <Spinner fullScreen />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bag-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Button title="Shop Now" onPress={() => router.push('/(tabs)/products')} style={{ width: 160, marginTop: 8 }} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <OrderCard order={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} tintColor={COLORS.primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff' },
  backBtn: { padding: 2 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12, backgroundColor: '#fff' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
});
