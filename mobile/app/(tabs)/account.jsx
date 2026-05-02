import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';
import Button from '../../components/Button';

function MenuRow({ icon, label, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? COLORS.error : COLORS.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
    </TouchableOpacity>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const { isLogin, userData, logout } = useApp();

  if (!isLogin) {
    return (
      <View style={styles.notLoggedIn}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={48} color={COLORS.textMuted} />
        </View>
        <Text style={styles.notLoggedInTitle}>Sign in to access your account</Text>
        <Button title="Sign In" onPress={() => router.push('/(auth)/login')} style={{ width: 200 }} />
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerLink}>New here? Create account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Profile */}
      <View style={styles.profileCard}>
        {userData?.avatar ? (
          <Image source={{ uri: userData.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>{userData?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData?.name}</Text>
          <Text style={styles.profileEmail}>{userData?.email}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>My Account</Text>
        <MenuRow icon="bag-outline" label="My Orders" onPress={() => router.push('/orders')} />
        <MenuRow icon="heart-outline" label="Wishlist" onPress={() => router.push('/(tabs)/wishlist')} />
        <MenuRow icon="location-outline" label="My Addresses" onPress={() => router.push('/address')} />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Settings</Text>
        <MenuRow icon="person-outline" label="Edit Profile" onPress={() => {}} />
        <MenuRow icon="lock-closed-outline" label="Change Password" onPress={() => router.push('/(auth)/forgot-password')} />
      </View>

      <View style={styles.menuSection}>
        <MenuRow icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  notLoggedIn: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff', gap: 16 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.lightGray, justifyContent: 'center', alignItems: 'center' },
  notLoggedInTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  registerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, paddingTop: 56, marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarFallback: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#fff', fontSize: 28, fontWeight: '800' },
  profileInfo: { marginLeft: 16, flex: 1 },
  profileName: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  profileEmail: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  menuSection: { backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12, marginBottom: 12, paddingHorizontal: 16, paddingVertical: 8, overflow: 'hidden' },
  menuSectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F9F9F9' },
  menuIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#fff7ed', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuIconDanger: { backgroundColor: '#fee2e2' },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  menuLabelDanger: { color: COLORS.error },
});
