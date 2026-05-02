import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchData } from '../../utils/api';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';

const { width: W } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist, isLogin } = useApp();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData(`/api/product/${id}`)
      .then((res) => {
        setProduct(res?.data);
        if (res?.data?.size?.length > 0) setSelectedSize(res.data.size[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner fullScreen />;
  if (!product) return (
    <View style={styles.error}>
      <Text style={styles.errorText}>Product not found</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={{ color: COLORS.primary }}>Go Back</Text></TouchableOpacity>
    </View>
  );

  const discount = product.discount || Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = async () => {
    if (product.size?.length > 0 && !selectedSize) {
      Alert.alert('Select a size', 'Please select a size before adding to cart.');
      return;
    }
    setAdding(true);
    try {
      await addToCart({
        productId: product._id,
        productTitle: product.name,
        image: product.images?.[0],
        price: product.price,
        oldPrice: product.oldPrice,
        discount: product.discount,
        quantity: qty,
        subTotal: product.price * qty,
        countInStock: product.countInStock,
        brand: product.brand,
        size: selectedSize,
      });
      Alert.alert('Added to Cart!', `${product.name} added to your cart.`, [
        { text: 'Continue', style: 'cancel' },
        { text: 'Go to Cart', onPress: () => router.push('/(tabs)/cart') },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back + Wishlist */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleWishlist(product._id)} style={styles.iconBtn}>
          <Ionicons name={inWishlist ? 'heart' : 'heart-outline'} size={22} color={inWishlist ? COLORS.error : COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Images */}
        <View>
          <Image source={{ uri: product.images?.[selectedImage] }} style={styles.mainImage} resizeMode="cover" />
          {product.images?.length > 1 && (
            <FlatList
              horizontal
              data={product.images}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={styles.thumbList}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.thumbWrap, selectedImage === index && styles.thumbActive]}
                  onPress={() => setSelectedImage(index)}
                >
                  <Image source={{ uri: item }} style={styles.thumb} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={styles.info}>
          {/* Brand + Name */}
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          {product.rating > 0 && (
            <View style={styles.ratingRow}>
              {[1,2,3,4,5].map((s) => (
                <Ionicons key={s} name={s <= Math.round(product.rating) ? 'star' : 'star-outline'} size={16} color="#f59e0b" />
              ))}
              <Text style={styles.ratingText}>{product.rating?.toFixed(1)}</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs. {product.price?.toLocaleString()}</Text>
            {product.oldPrice > product.price && (
              <Text style={styles.oldPrice}>Rs. {product.oldPrice?.toLocaleString()}</Text>
            )}
            {discount > 0 && <Badge label={`${discount}% OFF`} variant="primary" />}
          </View>

          {/* Stock */}
          <Badge
            label={product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Out of Stock'}
            variant={product.countInStock > 0 ? 'success' : 'error'}
            style={{ marginBottom: 16 }}
          />

          {/* Size selector */}
          {product.size?.length > 0 && (
            <View style={styles.sizeSection}>
              <Text style={styles.sizeTitle}>Size: <Text style={{ color: COLORS.primary }}>{selectedSize}</Text></Text>
              <View style={styles.sizeRow}>
                {product.size.map((sz) => (
                  <TouchableOpacity
                    key={sz}
                    style={[styles.sizeBtn, selectedSize === sz && styles.sizeBtnActive]}
                    onPress={() => setSelectedSize(sz)}
                  >
                    <Text style={[styles.sizeBtnText, selectedSize === sz && styles.sizeBtnTextActive]}>{sz}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.qtySection}>
            <Text style={styles.sizeTitle}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
                <Ionicons name="remove" size={18} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.min(product.countInStock, qty + 1))}>
                <Ionicons name="add" size={18} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.descTitle}>Product Details</Text>
            <Text style={styles.desc}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.ctaBar}>
        <Text style={styles.ctaPrice}>Rs. {(product.price * qty).toLocaleString()}</Text>
        <Button
          title={product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          onPress={handleAddToCart}
          loading={adding}
          disabled={product.countInStock === 0}
          style={styles.ctaBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  error: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 18, color: COLORS.text },
  topBar: { position: 'absolute', top: 48, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, zIndex: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  mainImage: { width: W, height: 300 },
  thumbList: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  thumbWrap: { borderWidth: 2, borderColor: 'transparent', borderRadius: 8 },
  thumbActive: { borderColor: COLORS.primary },
  thumb: { width: 60, height: 60, borderRadius: 6 },
  info: { padding: 16 },
  brand: { fontSize: 13, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 4, marginBottom: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 12 },
  ratingText: { fontSize: 13, color: COLORS.textLight, marginLeft: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  price: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  oldPrice: { fontSize: 16, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  sizeSection: { marginBottom: 20 },
  sizeTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8 },
  sizeBtnActive: { borderColor: COLORS.primary, backgroundColor: '#fff7ed' },
  sizeBtnText: { fontSize: 14, color: COLORS.text },
  sizeBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
  qtySection: { marginBottom: 20 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, alignSelf: 'flex-start' },
  qtyBtn: { padding: 10 },
  qtyValue: { paddingHorizontal: 20, fontSize: 16, fontWeight: '700', color: COLORS.text },
  descSection: { paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  descTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  desc: { fontSize: 14, color: COLORS.textLight, lineHeight: 22 },
  ctaBar: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff', gap: 12 },
  ctaPrice: { fontSize: 20, fontWeight: '800', color: COLORS.text, flex: 1 },
  ctaBtn: { flex: 2 },
});
