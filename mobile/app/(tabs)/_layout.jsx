import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/colors';
import { useApp } from '../../context/AppContext';

function TabIcon({ name, focused, label, badge }) {
  return (
    <View style={styles.tabIcon}>
      <View>
        <Ionicons name={focused ? name : `${name}-outline`} size={24} color={focused ? COLORS.primary : COLORS.textMuted} />
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { cartCount } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} label="Home" /> }}
      />
      <Tabs.Screen
        name="products"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} label="Browse" /> }}
      />
      <Tabs.Screen
        name="cart"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="bag" focused={focused} label="Cart" badge={cartCount} /> }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="heart" focused={focused} label="Wishlist" /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} label="Account" /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabIcon: { alignItems: 'center', gap: 2 },
  label: { fontSize: 10, color: COLORS.textMuted, fontWeight: '500' },
  labelActive: { color: COLORS.primary, fontWeight: '700' },
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: COLORS.error, borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
