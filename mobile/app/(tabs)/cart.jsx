import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';
import CartItem from '../../components/CartItem';
import Button from '../../components/Button';

export default function CartScreen() {
  const router = useRouter();
  const { cartData, cartTotal, isLogin } = useApp();

  if (!isLogin && cartData.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bag-outline" size={72} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Browse products and add items to your cart</Text>
        <Button title="Shop Now" onPress={() => router.push('/(tabs)/products')} style={styles.shopBtn} />
      </View>
    );
  }

  if (cartData.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="bag-outline" size={72} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Button title="Shop Now" onPress={() => router.push('/(tabs)/products')} style={styles.shopBtn} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.count}>{cartData.length} {cartData.length === 1 ? 'item' : 'items'}</Text>
      </View>

      <FlatList
        data={cartData}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <CartItem item={item} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>Rs. {cartTotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>Free</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs. {cartTotal.toLocaleString()}</Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={() => {
            if (!isLogin) { router.push('/(auth)/login'); return; }
            router.push('/checkout');
          }}
          style={styles.checkoutBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  count: { fontSize: 14, color: COLORS.textMuted },
  list: { padding: 16, paddingBottom: 0 },
  summary: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: COLORS.textLight },
  summaryValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 4, marginBottom: 14 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  checkoutBtn: {},
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  shopBtn: { marginTop: 8, width: 160 },
});
