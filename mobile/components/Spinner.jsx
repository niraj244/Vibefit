import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';

export default function Spinner({ size = 'large', fullScreen = false, color }) {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color || COLORS.primary} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={color || COLORS.primary} />;
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
