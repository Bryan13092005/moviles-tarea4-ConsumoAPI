import { useEffect, useState } from 'react';
import { Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface Props {
  alto?: number;
  ancho?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

// Marcador de posición animado mientras cargan los datos
export function Esqueleto({ alto = 16, ancho = '100%', style }: Props) {
  const theme = useTheme();
  const [opacidad] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidad, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacidad, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [opacidad]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ height: alto, width: ancho, borderRadius: 8, backgroundColor: theme.backgroundSelected, opacity: opacidad }, style]}
    />
  );
}
