import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product, style }) {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useApp();
  const inWishlist = isInWishlist(product._id);
  const discount = product.discount || Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => router.push(`/product/${product._id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.images?.[0] }} style={styles.image} resizeMode="cover" />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistBtn}
          onPress={() => toggleWishlist(product._id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name={inWishlist ? 'heart' : 'heart-outline'} size={20} color={inWishlist ? '#ef4444' : COLORS.textMuted} />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs. {product.price?.toLocaleString()}</Text>
          {product.oldPrice > product.price && (
            <Text style={styles.oldPrice}>Rs. {product.oldPrice?.toLocaleString()}</Text>
          )}
        </View>
        {product.rating > 0 && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.rating}>{product.rating?.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 160 },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: COLORS.primary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  wishlistBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#fff', borderRadius: 20, padding: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  info: { padding: 10 },
  name: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  brand: { fontSize: 11, color: COLORS.textMuted, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  oldPrice: { fontSize: 12, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  rating: { fontSize: 12, color: COLORS.textLight },
});
