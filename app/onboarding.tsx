import { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useApp } from '../src/components/AppProvider';
import { PaginationDots, PostCallFloatingCard, PrimaryButton, SecondaryButton, Txt } from '../src/components/ui';
import { CallIllustration, DirectionsIllustration, FloatingCardScene } from '../src/components/illustrations';
import { routes } from '../src/navigation';
import { type, useTheme } from '../src/theme';

export default function Onboarding() {
  const { copy, arabic, busy, failed, finishWelcome } = useApp();
  const { colors, isDark } = useTheme();
  const [slide, setSlide] = useState(0);
  const slides = copy.onboarding.slides;
  const last = slide === slides.length - 1;
  const finish = async (permissions: boolean) => {
    if (await finishWelcome()) router.replace(permissions ? routes.permissions : routes.home);
  };
  const advance = () => {
    if (!last) setSlide(slide + 1);
    else void finish(true);
  };
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.skipRow, { flexDirection: arabic ? 'row-reverse' : 'row' }]}>
        <SecondaryButton label={copy.onboarding.skip} disabled={busy} onPress={() => void finish(false)} />
      </View>
      <View style={styles.stage}>
        {slide === 0 && <CallIllustration />}
        {slide === 1 && <DirectionsIllustration />}
        {slide === 2 && <FloatingCardScene card={<PostCallFloatingCard preview
          appName={copy.common.appName} title={copy.onboarding.floatingTitle} number="+966 50 123 4567"
          ctaLabel={copy.onboarding.floatingCta} onClose={() => setSlide(0)} onCta={() => setSlide(0)} />} />}
      </View>
      <View style={styles.textBlock}>
        <Txt style={[type.display, { fontWeight: '700' }]}>{slides[slide].title}</Txt>
        <Txt tone="muted" style={type.body}>{slides[slide].description}</Txt>
      </View>
      <View style={styles.footer}>
        <PaginationDots count={slides.length} active={slide} />
        <PrimaryButton label={last ? copy.onboarding.start : copy.onboarding.next} disabled={busy} onPress={advance} />
        {failed && <Txt tone="danger" style={type.small}>{copy.errors.preferences}</Txt>}
        <Txt tone="muted" style={[type.small, styles.conditional]}>{copy.onboarding.conditional}</Txt>
      </View>
    </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 24, paddingVertical: 8 },
  skipRow: { minHeight: 48, alignItems: 'center' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  textBlock: { gap: 12, paddingBottom: 24, maxWidth: 600, width: '100%', alignSelf: 'center' },
  footer: { gap: 16, paddingBottom: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
  conditional: { textAlign: 'center' },
});
