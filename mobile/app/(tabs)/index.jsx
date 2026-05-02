import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, FlatList,
  StyleSheet, Dimensions, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchData } from '../../utils/api';
import { COLORS } from '../../utils/colors';
import ProductCard from '../../components/ProductCard';
import Spinner from '../../components/Spinner';
import { useApp } from '../../context/AppContext';

const { width: W } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { catData, userData, isLogin } = useApp();
  const [slides, setSlides] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [slideRes, featRes, newRes] = await Promise.all([
        fetchData('/api/homeSlides/get'),
        fetchData('/api/product/getAllProducts?page=1&perPage=8&isFeatured=true'),
        fetchData('/api/product/getAllProductsByPrice?page=1&perPage=8'),
      ]);
      setSlides(slideRes?.data || []);
      setFeatured(featRes?.data || []);
      setNewArrivals(newRes?.data || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <Spinner fullScreen />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{isLogin ? `Hey, ${userData?.name?.split(' ')[0]}! 👋` : 'Welcome to'}</Text>
          <Text style={styles.brandName}>VibeFit</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/search')} style={styles.searchBtn}>
          <Ionicons name="search" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Hero Banner */}
      {slides.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.sliderWrap}>
          {slides.map((slide) => (
            <Image key={slide._id} source={{ uri: slide.image }} style={styles.slide} resizeMode="cover" />
          ))}
        </ScrollView>
      )}

      {/* Categories */}
      {catData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <FlatList
            horizontal
            data={catData.slice(0, 10)}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.catCard}
                onPress={() => router.push({ pathname: '/(tabs)/products', params: { catId: item._id, catName: item.name } })}
              >
                <Image source={{ uri: item.image }} style={styles.catImage} />
                <Text style={styles.catName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={featured}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, gap: 12 }}
            renderItem={({ item }) => <ProductCard product={item} style={{ width: W * 0.46 }} />}
          />
        </View>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <View style={[styles.section, { marginBottom: 24 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/products')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={newArrivals}
            keyExtractor={(item) => item._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, gap: 12 }}
            renderItem={({ item }) => <ProductCard product={item} style={{ width: W * 0.46 }} />}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, backgroundColor: '#fff',
  },
  greeting: { fontSize: 13, color: COLORS.textMuted },
  brandName: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  searchBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.lightGray, justifyContent: 'center', alignItems: 'center' },
  sliderWrap: { marginBottom: 8 },
  slide: { width: W, height: 200 },
  section: { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, paddingHorizontal: 16, marginBottom: 12 },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  catCard: { alignItems: 'center', width: 80 },
  catImage: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.border },
  catName: { fontSize: 11, fontWeight: '600', color: COLORS.text, marginTop: 6, textAlign: 'center' },
});
