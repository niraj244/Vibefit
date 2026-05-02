import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Badge from './Badge';
import { COLORS } from '../utils/colors';

const STATUS_VARIANT = {
  confirm: 'info',
  pending: 'warning',
  processing: 'warning',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  return_requested: 'warning',
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NP', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const firstProduct = order.products?.[0];

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <Image source={{ uri: firstProduct?.image }} style={styles.thumb} />
        <View style={styles.headerInfo}>
          <Text style={styles.orderId}>#{order._id?.slice(-8).toUpperCase()}</Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
          <View style={styles.row}>
            <Badge label={order.order_status} variant={STATUS_VARIANT[order.order_status] || 'gray'} />
            {order.returnRequested && <Badge label="Return Req." variant="error" style={{ marginLeft: 6 }} />}
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.total}>Rs. {order.totalAmt?.toLocaleString()}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>

      {/* Expanded detail */}
      {expanded && (
        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Items ({order.products?.length})</Text>
          {order.products?.map((p, i) => (
            <View key={i} style={styles.productRow}>
              <Image source={{ uri: p.image }} style={styles.productImg} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.productName} numberOfLines={2}>{p.productTitle}</Text>
                <Text style={styles.productMeta}>
                  Qty: {p.quantity}{p.size ? ` · Size: ${p.size}` : ''} · Rs. {p.price?.toLocaleString()}
                </Text>
              </View>
            </View>
          ))}

          {/* Payment */}
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment</Text>
            <Badge
              label={order.payment_status}
              variant={order.payment_status === 'paid' ? 'success' : 'warning'}
            />
          </View>

          {/* Pathao Tracking */}
          {order.pathaoConsignmentId ? (
            <View style={styles.trackingBox}>
              <Text style={styles.trackingTitle}>Pathao Tracking</Text>
              <Text style={styles.trackingId}>{order.pathaoConsignmentId}</Text>
              <TouchableOpacity
                style={styles.trackBtn}
                onPress={() => router.push({ pathname: '/orders/tracking', params: { orderId: order._id, consignmentId: order.pathaoConsignmentId } })}
              >
                <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                <Text style={styles.trackBtnText}>Track Order</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Return request button */}
          {order.order_status === 'delivered' && !order.returnRequested && (
            <TouchableOpacity
              style={styles.returnBtn}
              onPress={() => router.push({ pathname: '/orders/return', params: { orderId: order._id } })}
            >
              <Text style={styles.returnBtnText}>Request Return</Text>
            </TouchableOpacity>
          )}
          {order.returnRequested && (
            <View style={styles.returnStatus}>
              <Text style={styles.label}>Return Status: </Text>
              <Badge label={order.returnStatus || 'pending'} variant="warning" />
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  thumb: { width: 56, height: 56, borderRadius: 8 },
  headerInfo: { flex: 1, marginLeft: 12 },
  orderId: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  date: { fontSize: 11, color: COLORS.textMuted, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  total: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  body: { paddingHorizontal: 14, paddingBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productImg: { width: 44, height: 44, borderRadius: 6 },
  productName: { fontSize: 13, fontWeight: '500', color: COLORS.text },
  productMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 13, color: COLORS.textLight },
  trackingBox: {
    backgroundColor: '#fff7ed', borderRadius: 8, padding: 10, marginTop: 8,
    borderWidth: 1, borderColor: '#fed7aa',
  },
  trackingTitle: { fontSize: 12, fontWeight: '700', color: '#9a3412', marginBottom: 2 },
  trackingId: { fontSize: 13, color: COLORS.text, fontWeight: '600', marginBottom: 6 },
  trackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  returnBtn: {
    marginTop: 10, borderWidth: 1.5, borderColor: COLORS.error,
    borderRadius: 8, padding: 10, alignItems: 'center',
  },
  returnBtnText: { color: COLORS.error, fontWeight: '600', fontSize: 13 },
  returnStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
});
