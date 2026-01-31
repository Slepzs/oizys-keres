import React from 'react';
import { Text, StyleSheet, View, TextStyle } from 'react-native';
import { colors, fontSize, fontWeight } from '@/constants/theme';
import { formatNumber } from '@/utils/format';

interface NumberDisplayProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function NumberDisplay({
  value,
  label,
  size = 'md',
  color = colors.text,
}: NumberDisplayProps) {
  const valueStyles: TextStyle[] = [
    styles.value,
    styles[`value_${size}`],
    { color },
  ];

  return (
    <View style={styles.container}>
      <Text style={valueStyles}>{formatNumber(value)}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  value: {
    fontWeight: fontWeight.bold,
  },
  value_sm: {
    fontSize: fontSize.md,
  },
  value_md: {
    fontSize: fontSize.xl,
  },
  value_lg: {
    fontSize: fontSize.xxl,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
