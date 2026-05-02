import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { useApp } from '../context/AppContext';

export default function CartItem({ item }) {
  const { removeCartItem, updateCartItemQty } = useApp();
  const [qty, setQty] = useState(item.quantity);

  const changeQty = async (newQty) => {
    if (newQty < 1) return;
    if (newQty > item.countInStock) return;
    setQty(newQty);
    await updateCartItemQty(item._id, newQty, item.price * newQty, item.isGuest);
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.productTitle}</Text>
        {item.size ? <Text style={styles.size}>Size: {item.size}</Text> : null}
        <Text style={styles.price}>Rs. {item.price?.toLocaleString()}</Text>
        <View style={styles.actions}>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(qty - 1)}>
              <Ionicons name="remove" size={16} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.qty}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(qty + 1)}>
              <Ionicons name="add" size={16} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeCartItem(item._id, item.isGuest)} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.subtotalWrap}>
        <Text style={styles.subtotal}>Rs. {(item.price * qty)?.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  image: { width: 80, height: 80, borderRadius: 8 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  size: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  price: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 6 },
  qtyBtn: { padding: 6 },
  qty: { paddingHorizontal: 12, fontSize: 14, fontWeight: '600' },
  removeBtn: { padding: 4 },
  subtotalWrap: { justifyContent: 'flex-start', alignItems: 'flex-end', minWidth: 70 },
  subtotal: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
