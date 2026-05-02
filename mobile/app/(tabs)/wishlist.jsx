import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';

const { width: W } = Dimensions.get('window');

export default function WishlistScreen() {
  const router = useRouter();
  const { myListData, isLogin } = useApp();

  if (!isLogin) {
    return (
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={72} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Sign in to see your wishlist</Text>
        <Button title="Sign In" onPress={() => router.push('/(auth)/login')} style={{ width: 160 }} />
      </View>
    );
  }

  if (myListData.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={72} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptyText}>Save items you love by tapping the heart icon</Text>
        <Button title="Browse Products" onPress={() => router.push('/(tabs)/products')} style={{ width: 200, marginTop: 8 }} />
      </View>
    );
  }

  const CARD_W = (W - 48) / 2;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wishlist</Text>
        <Text style={styles.count}>{myListData.length} items</Text>
      </View>
      <FlatList
        data={myListData}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ProductCard product={{ ...item, _id: item.productId, images: [item.image], name: item.productTitle }} style={{ width: CARD_W }} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  count: { fontSize: 14, color: COLORS.textMuted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12, backgroundColor: '#fff' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
});
