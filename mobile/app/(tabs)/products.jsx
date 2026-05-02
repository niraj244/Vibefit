import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, ScrollView, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchData, postData } from '../../utils/api';
import { COLORS } from '../../utils/colors';
import ProductCard from '../../components/ProductCard';
import Spinner from '../../components/Spinner';
import { useApp } from '../../context/AppContext';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - 48) / 2;

export default function ProductsScreen() {
  const { catId, catName } = useLocalSearchParams();
  const router = useRouter();
  const { catData } = useApp();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCat, setSelectedCat] = useState(catId || '');
  const [sortBy, setSortBy] = useState('newest');

  const SORT_OPTIONS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Top Rated', value: 'rating' },
  ];

  const loadProducts = useCallback(async (pg = 1, reset = false) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      let data;
      if (search.trim()) {
        const res = await postData('/api/product/search/get', { query: search, page: pg, perPage: 12 });
        data = res?.data;
      } else if (selectedCat) {
        const res = await fetchData(`/api/product/getAllProductsByCatId/${selectedCat}?page=${pg}&perPage=12`);
        data = res?.data;
      } else {
        const res = await fetchData(`/api/product/getAllProducts?page=${pg}&perPage=12`);
        data = res?.data;
      }
      const list = Array.isArray(data) ? data : (data?.products || []);
      if (reset || pg === 1) setProducts(list);
      else setProducts((prev) => [...prev, ...list]);
      setHasMore(list.length === 12);
    } catch {}
    finally { setLoading(false); setLoadingMore(false); }
  }, [search, selectedCat, sortBy]);

  useEffect(() => { setPage(1); loadProducts(1, true); }, [search, selectedCat, sortBy]);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {catName ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.headerTitle}>{catName || 'Browse Products'}</Text>
        <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <Spinner fullScreen />
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ProductCard product={item} style={{ width: CARD_W }} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <Spinner /> : null}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFilter(false)} />
        <View style={styles.filterSheet}>
          <Text style={styles.filterTitle}>Filter & Sort</Text>

          <Text style={styles.filterLabel}>Sort By</Text>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.filterOption, sortBy === opt.value && styles.filterOptionActive]}
              onPress={() => { setSortBy(opt.value); setShowFilter(false); }}
            >
              <Text style={[styles.filterOptionText, sortBy === opt.value && styles.filterOptionTextActive]}>{opt.label}</Text>
              {sortBy === opt.value && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}

          <Text style={[styles.filterLabel, { marginTop: 16 }]}>Category</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            <TouchableOpacity
              style={[styles.filterOption, !selectedCat && styles.filterOptionActive]}
              onPress={() => { setSelectedCat(''); setShowFilter(false); }}
            >
              <Text style={[styles.filterOptionText, !selectedCat && styles.filterOptionTextActive]}>All Categories</Text>
            </TouchableOpacity>
            {catData.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={[styles.filterOption, selectedCat === cat._id && styles.filterOptionActive]}
                onPress={() => { setSelectedCat(cat._id); setShowFilter(false); }}
              >
                <Text style={[styles.filterOptionText, selectedCat === cat._id && styles.filterOptionTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 52, paddingBottom: 12, backgroundColor: '#fff',
  },
  backBtn: { marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.text },
  filterBtn: { padding: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12,
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: COLORS.border, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  filterSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 36, position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  filterTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  filterLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  filterOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  filterOptionActive: { backgroundColor: '#fff7ed' },
  filterOptionText: { fontSize: 14, color: COLORS.text },
  filterOptionTextActive: { color: COLORS.primary, fontWeight: '700' },
});
