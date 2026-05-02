import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';

export default function Button({ title, onPress, loading, variant = 'primary', style, textStyle, disabled }) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        styles.base,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        (loading || disabled) && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : COLORS.primary} size="small" />
      ) : (
        <Text style={[styles.text, isPrimary && styles.textPrimary, isOutline && styles.textOutline, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primary: { backgroundColor: COLORS.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  disabled: { opacity: 0.6 },
  text: { fontSize: 15, fontWeight: '600' },
  textPrimary: { color: '#fff' },
  textOutline: { color: COLORS.primary },
});
