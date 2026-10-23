import { View } from 'react-native';
import { useTheme, cardShadow } from '../theme';
import { IconCheck, IconPhone, IconWhatsApp } from './icons';

/** View-composed illustrations in mint/emerald — light, no raster assets. */

function Stage({ children, size = 220 }: { children: React.ReactNode; size?: number }) {
  const { colors } = useTheme();
  return <View style={{ width: size, height: size * 0.86, borderRadius: 32, backgroundColor: colors.raised,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    <View style={{ position: 'absolute', width: size * 0.66, height: size * 0.66, borderRadius: size * 0.33,
      backgroundColor: colors.surface, opacity: 0.55, top: -size * 0.16, alignSelf: 'flex-start', start: -size * 0.14 }} />
    <View style={{ position: 'absolute', width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25,
      backgroundColor: colors.surface, opacity: 0.4, bottom: -size * 0.1, alignSelf: 'flex-end', end: -size * 0.08 }} />
    {children}
  </View>;
}

/** Slide 1 — phone, contact avatar, WhatsApp badge. */
export function CallIllustration() {
  const { colors } = useTheme();
  return <Stage>
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 104, height: 176, borderRadius: 20, backgroundColor: colors.surface,
        borderWidth: 3, borderColor: colors.primaryDark, padding: 10, gap: 8, ...cardShadow }}>
        <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: colors.primaryDark, alignSelf: 'center', marginTop: 2 }} />
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.raised,
          alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 8 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primaryDark }} />
          <View style={{ width: 40, height: 20, borderRadius: 12, backgroundColor: colors.primaryDark, marginTop: 6 }} />
        </View>
        <View style={{ width: 72, height: 8, borderRadius: 4, backgroundColor: colors.outline, alignSelf: 'center' }} />
        <View style={{ width: 52, height: 8, borderRadius: 4, backgroundColor: colors.outline, alignSelf: 'center' }} />
      </View>
      <View style={{ position: 'absolute', bottom: -12, alignSelf: 'flex-end', end: -16 }}>
        <IconWhatsApp size={52} />
      </View>
      <View style={{ position: 'absolute', top: 8, start: -30 }}>
        <IconPhone size={26} color={colors.primaryDark} />
      </View>
    </View>
  </Stage>;
}

/** Slide 2 — incoming and outgoing call directions. */
export function DirectionsIllustration() {
  const { colors } = useTheme();
  return <Stage>
    <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.surface, alignItems: 'center',
      justifyContent: 'center', ...cardShadow }}>
      <IconPhone size={44} color={colors.primaryDark} filled={false} />
    </View>
    <View style={{ position: 'absolute', top: 26, start: 34, width: 52, height: 36, borderTopWidth: 3,
      borderStartWidth: 3, borderTopStartRadius: 40, borderColor: colors.primary }} />
    <View style={{ position: 'absolute', top: 18, start: 30, width: 0, height: 0,
      borderTopWidth: 7, borderEndWidth: 10, borderBottomWidth: 7, borderEndColor: 'transparent',
      borderBottomColor: 'transparent', borderTopColor: colors.primary, transform: [{ rotate: '-15deg' }] }} />
    <View style={{ position: 'absolute', bottom: 26, end: 34, width: 52, height: 36, borderBottomWidth: 3,
      borderEndWidth: 3, borderBottomEndRadius: 40, borderColor: colors.primaryDark }} />
    <View style={{ position: 'absolute', bottom: 18, end: 30, width: 0, height: 0,
      borderBottomWidth: 7, borderStartWidth: 10, borderTopWidth: 7, borderStartColor: colors.primaryDark,
      borderTopColor: 'transparent', borderEndColor: 'transparent', transform: [{ rotate: '-15deg' }] }} />
  </Stage>;
}

/** Slide 3 — the floating card over a wallpaper-like surface. */
export function FloatingCardScene({ card }: { card: React.ReactNode }) {
  return <View style={{ width: 220, height: 190, borderRadius: 32, backgroundColor: '#DCEDE4', alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden' }}>
    <View style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#BFE3D3', top: -30, start: -20 }} />
    <View style={{ position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: '#CBE8DB', bottom: -20, end: -14 }} />
    <View style={{ position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#AFDCC8', bottom: 18, start: 16 }} />
    {card}
  </View>;
}

/** Permissions screen — shield with checkmark. */
export function ShieldIllustration({ size = 150 }: { size?: number }) {
  const { colors } = useTheme();
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.raised,
    alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.46, height: size * 0.56, borderRadius: size * 0.12,
      borderBottomLeftRadius: size * 0.3, borderBottomRightRadius: size * 0.3,
      backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...cardShadow }}>
      <IconCheck size={size * 0.24} color={colors.primary} />
    </View>
  </View>;
}
