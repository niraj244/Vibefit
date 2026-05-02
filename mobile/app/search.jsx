import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { postData } from '../utils/api';
import { COLORS } from '../utils/colors';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const { width: W } = Dimensions.get('window');

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const doSearch = async (q) => {
    setLoading(true);
    try {
      const res = await postData('/api/product/search/get', { query: q, page: 1, perPage: 20 });
      setResults(res?.data || []);
      setSearched(true);
    } catch {}
    finally { setLoading(false); }
  };

  const CARD_W = (W - 48) / 2;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <Spinner fullScreen />
      ) : searched && results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <ProductCard product={item} style={{ width: CARD_W }} />}
        />
      ) : (
        <View style={styles.hint}>
          <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.hintText}>Start typing to search products</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 2 },
  input: { flex: 1, fontSize: 16, color: COLORS.text, paddingVertical: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.textMuted },
  hint: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  hintText: { fontSize: 15, color: COLORS.textMuted },
});
