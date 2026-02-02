import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { EquipmentSlot } from './EquipmentSlot';
import type { EquipmentSlot as EquipmentSlotType, EquipmentState } from '@/game/types';
import { EQUIPMENT_SLOTS } from '@/game/types';

interface EquipmentPanelProps {
  equipment: EquipmentState;
  onSlotPress?: (slot: EquipmentSlotType) => void;
}

export function EquipmentPanel({ equipment, onSlotPress }: EquipmentPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Equipment</Text>
      <View style={styles.grid}>
        {EQUIPMENT_SLOTS.map((slot) => (
          <EquipmentSlot
            key={slot}
            slot={slot}
            equippedItemId={equipment[slot]}
            onPress={() => onSlotPress?.(slot)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
});
