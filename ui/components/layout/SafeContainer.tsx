import React from 'react';
import { View, StyleSheet, ViewStyle, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

import { PlayerHeaderBar } from './PlayerHeaderBar';
import { getSafeContainerMetrics } from './SafeContainer.metrics';

interface SafeContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padTop?: boolean;
  padBottom?: boolean;
  showPlayerHeader?: boolean;
}

export function SafeContainer({
  children,
  style,
  padTop = true,
  padBottom = true,
  showPlayerHeader = false,
}: SafeContainerProps) {
  const insets = useSafeAreaInsets();
  const metrics = getSafeContainerMetrics({
    insetsTop: insets.top,
    insetsBottom: insets.bottom,
    padTop,
    padBottom,
    showPlayerHeader,
  });

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../../../assets/images/background.png')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <View pointerEvents="none" style={styles.overlay} />
        
        {showPlayerHeader ? (
          <>
          <View 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: insets.top - 10, 
            backgroundColor: colors.background, // Change this if you want a different color
            zIndex: 10 
          }} 
        />
          <View style={[styles.fixedHeader, { top: metrics.headerTop - 10 }]}>
            <PlayerHeaderBar />
          </View>
          </>
        ) : null}
        <View
          style={[
            styles.container,
            {
              paddingTop: metrics.contentPaddingTop,
              paddingBottom: metrics.contentPaddingBottom,
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
  fixedHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 2,
    // paddingHorizontal: spacing.md,
  },
});
