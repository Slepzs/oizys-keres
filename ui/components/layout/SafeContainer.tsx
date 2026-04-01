import React from 'react';
import { View, StyleSheet, ViewStyle, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

interface SafeContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padTop?: boolean;
  padBottom?: boolean;
}

export function SafeContainer({
  children,
  style,
  padTop = true,
  padBottom = true,
}: SafeContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../../../assets/images/background.png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <View pointerEvents="none" style={styles.overlay} />
        <View
          style={[
            styles.container,
            {
              paddingTop: padTop ? insets.top + spacing.md : spacing.md,
              paddingBottom: padBottom ? insets.bottom + spacing.md : spacing.md,
            },
            style,
          ]}
        >
          {children}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.35,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 15, 0.72)',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
  },
});
