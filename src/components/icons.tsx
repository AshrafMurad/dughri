import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/** View-built line icons: consistent 2px strokes, no icon-font dependency.
 * Decorative only (labels carry meaning); hidden from accessibility. */

const stroke = 2;

function Bar({ color, w, h, style }: { color: string; w: number; h: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ width: w, height: h, backgroundColor: color, borderRadius: stroke / 2 }, style]} />;
}

export function IconChevron({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.muted;
  const arm = size * 0.42;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ position: 'absolute', transform: [{ rotate: '-45deg' }] }}>
      <Bar color={c} w={arm} h={stroke} style={{ position: 'absolute', top: 0, left: 0 }} />
      <Bar color={c} w={stroke} h={arm} style={{ position: 'absolute', top: 0, left: 0 }} />
    </View>
  </View>;
}

export function IconClose({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.muted;
  const arm = size * 0.72;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Bar color={c} w={arm} h={stroke} style={{ transform: [{ rotate: '45deg' }] }} />
    <Bar color={c} w={arm} h={stroke} style={{ position: 'absolute', transform: [{ rotate: '-45deg' }] }} />
  </View>;
}

export function IconCheck({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.primary;
  const arm = size * 0.5;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Bar color={c} w={arm} h={stroke} style={{ transform: [{ rotate: '45deg' }, { translateY: -size * 0.06 }] }} />
    <Bar color={c} w={size * 0.8} h={stroke} style={{ position: 'absolute', transform: [{ rotate: '-45deg' }, { translateY: size * 0.14 }] }} />
  </View>;
}

export function IconPhone({ size = 20, color, filled = false }: { size?: number; color?: string; filled?: boolean }) {
  const c = color ?? useTheme().colors.primary;
  const end = size * 0.3;
  const bar = size * 0.52;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ rotate: '-45deg' }] }}>
      <View style={{ width: end, height: end, borderRadius: end / 2, backgroundColor: c,
        borderWidth: filled ? 0 : stroke, borderColor: c }} />
      <View style={{ width: bar, height: stroke + 2, backgroundColor: c }} />
      <View style={{ width: end, height: end, borderRadius: end / 2, backgroundColor: c,
        borderWidth: filled ? 0 : stroke, borderColor: c }} />
    </View>
  </View>;
}

export function IconWhatsApp({ size = 24 }: { size?: number }) {
  const { colors } = useTheme();
  const inner = size * 0.34;
  return <View importantForAccessibility="no" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: inner, height: inner * 0.62, borderRadius: inner * 0.3, backgroundColor: colors.onPrimary, transform: [{ rotate: '-40deg' }] }} />
  </View>;
}

export function IconGear({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.muted;
  const ring = size * 0.56;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {[0, 60, 120, 180, 240, 300].map(deg => (
      <View key={deg} importantForAccessibility="no"
        style={{ position: 'absolute', width: size, height: size, alignItems: 'center',
          transform: [{ rotate: `${deg}deg` }] }}>
        <Bar color={c} w={size * 0.14} h={size * 0.18} />
      </View>
    ))}
    <View style={{ width: ring, height: ring, borderRadius: ring / 2, borderWidth: stroke, borderColor: c,
      alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: ring * 0.32, height: ring * 0.32, borderRadius: ring * 0.16, backgroundColor: c }} />
    </View>
  </View>;
}

export function IconShield({ size = 22, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.primary;
  return <View importantForAccessibility="no" style={{ width: size, height: size }}>
    <View style={{ width: size * 0.78, height: size * 0.92, borderWidth: stroke, borderColor: c, borderRadius: size * 0.2,
      borderBottomLeftRadius: size * 0.42, borderBottomRightRadius: size * 0.42, alignSelf: 'center' }} />
  </View>;
}

export function IconOverlay({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.primary;
  return <View importantForAccessibility="no" style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: size * 0.9, height: size * 0.68, borderRadius: 4, borderWidth: stroke, borderColor: c, alignSelf: 'flex-start' }} />
    <View style={{ width: size * 0.62, height: size * 0.44, borderRadius: 4, borderWidth: stroke, borderColor: c,
      backgroundColor: 'transparent', position: 'absolute', bottom: -1, right: -1 }} />
  </View>;
}

export function IconBell({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.primary;
  const body = size * 0.64;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-start' }}>
    <View style={{ width: body, height: body, borderRadius: body / 2, borderTopLeftRadius: body * 0.62, borderTopRightRadius: body * 0.62,
      borderWidth: stroke, borderColor: c, marginTop: size * 0.08 }} />
    <Bar color={c} w={stroke} h={size * 0.16} style={{ marginTop: stroke }} />
    <View style={{ width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, borderWidth: stroke, borderColor: c,
      position: 'absolute', bottom: 0, backgroundColor: 'transparent' }} />
  </View>;
}

export function IconClock({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.muted;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.82, height: size * 0.82, borderRadius: size * 0.41, borderWidth: stroke, borderColor: c }} />
    <Bar color={c} w={stroke} h={size * 0.26} style={{ position: 'absolute', top: size * 0.26 }} />
    <Bar color={c} w={size * 0.2} h={stroke} style={{ position: 'absolute', top: size * 0.48, left: '50%' }} />
  </View>;
}

export function IconTrash({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.muted;
  const body = size * 0.66;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center' }}>
    <Bar color={c} w={body} h={stroke} style={{ marginTop: stroke }} />
    <View style={{ width: body * 0.84, height: size * 0.62, borderWidth: stroke, borderColor: c, borderTopWidth: 0,
      borderBottomLeftRadius: 4, borderBottomRightRadius: 4, marginTop: 0 }} />
    <Bar color={c} w={size * 0.3} h={stroke} style={{ position: 'absolute', top: -1 }} />
  </View>;
}

export function IconGlobe({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.muted;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.84, height: size * 0.84, borderRadius: size * 0.42, borderWidth: stroke, borderColor: c }} />
    <View style={{ width: size * 0.84, height: size * 0.36, borderWidth: stroke, borderColor: c, borderRadius: size * 0.2, position: 'absolute' }} />
    <Bar color={c} w={stroke} h={size * 0.84} style={{ position: 'absolute' }} />
  </View>;
}

export function IconArrow({ size = 20, color }: { size?: number; color?: string }) {
  const c = color ?? useTheme().colors.primary;
  const arm = size * 0.42;
  return <View importantForAccessibility="no" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Bar color={c} w={size * 0.7} h={stroke} />
    <View style={{ position: 'absolute', right: size * 0.12 }}>
      <Bar color={c} w={arm} h={stroke} style={{ transform: [{ rotate: '-45deg' }] }} />
      <Bar color={c} w={arm} h={stroke} style={{ position: 'absolute', top: 0, transform: [{ rotate: '45deg' }] }} />
    </View>
  </View>;
}

export const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center' } });
