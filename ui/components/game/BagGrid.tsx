import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BagSlot, SLOT_SIZE } from './BagSlot';
import { spacing } from '@/constants/theme';
import type { BagState } from '@/game/types';

interface BagGridProps {
  bag: BagState;
  selectedIndex: number | null;
  onSelectIndex: (index: number | null) => void;
}

export function BagGrid({ bag, selectedIndex, onSelectIndex }: BagGridProps) {
  const [gridWidth, setGridWidth] = useState(0);

  const handleSlotPress = (index: number) => {
    onSelectIndex(selectedIndex === index ? null : index);
  };

  const columns = useMemo(() => {
    const slotOuterSize = SLOT_SIZE + spacing.xs * 2;
    const possible = gridWidth > 0 ? Math.floor(gridWidth / slotOuterSize) : 4;
    if (possible >= 6) return 6;
    if (possible >= 5) return 5;
    return 4;
  }, [gridWidth]);

  const rows = useMemo(() => {
    const nextRows: (typeof bag.slots)[] = [];
    for (let i = 0; i < bag.slots.length; i += columns) {
      nextRows.push(bag.slots.slice(i, i + columns));
    }
    return nextRows;
  }, [bag.slots, columns]);

  return (
    <View style={styles.container}>
      <View
        style={styles.grid}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          if (width !== gridWidth) {
            setGridWidth(width);
          }
        }}
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((slot, colIndex) => {
              const index = rowIndex * columns + colIndex;
              return (
                <BagSlot
                  key={index}
                  slot={slot}
                  isSelected={selectedIndex === index}
                  onPress={() => handleSlotPress(index)}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

