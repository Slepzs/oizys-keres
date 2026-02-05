import React, { useEffect } from 'react';
import { Platform, Text, type StyleProp, type TextStyle } from 'react-native';

const RPG_AWESOME_CSS_URL =
  'https://nagoshiashumari.github.io/Rpg-Awesome/stylesheets/rpg-awesome.min.css';

let hasInjectedStylesheet = false;

function ensureRpgAwesomeStylesheet(): void {
  if (Platform.OS !== 'web' || hasInjectedStylesheet || typeof document === 'undefined') {
    return;
  }

  const existing = document.querySelector(`link[href="${RPG_AWESOME_CSS_URL}"]`);
  if (existing) {
    hasInjectedStylesheet = true;
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = RPG_AWESOME_CSS_URL;
  document.head.appendChild(link);
  hasInjectedStylesheet = true;
}

export interface RpgIconProps {
  name: string;
  fallback: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function RpgIcon({
  name,
  fallback,
  size = 16,
  color,
  style,
  accessibilityLabel,
}: RpgIconProps) {
  useEffect(() => {
    ensureRpgAwesomeStylesheet();
  }, []);

  if (Platform.OS === 'web') {
    const webStyle: React.CSSProperties = {
      fontSize: `${size}px`,
      color,
      lineHeight: `${size}px`,
      display: 'inline-block',
      width: `${size}px`,
      textAlign: 'center',
      verticalAlign: 'middle',
    };

    return React.createElement('i', {
      className: `ra ra-${name}`,
      style: webStyle,
      'aria-label': accessibilityLabel,
      'aria-hidden': accessibilityLabel ? undefined : true,
    });
  }

  return (
    <Text
      style={[
        {
          fontSize: size,
          color,
          lineHeight: size + 2,
          textAlign: 'center',
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      {fallback}
    </Text>
  );
}
