import { useSyncExternalStore } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Engine from '../../modules/dughri-call-engine';
import { useApp } from '../../src/components/AppProvider';
import { AppScreen, CallHistoryRow, SectionHeading, Txt } from '../../src/components/ui';
import { IconTrash } from '../../src/components/icons';
import { clearRecents, getRecents, subscribeRecents } from '../../src/lib/recents';
import { type, useTheme } from '../../src/theme';

function timeLabel(at: number, today: string): string {
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(at);
  const sameDay = new Date(at).toDateString() === new Date().toDateString();
  return sameDay ? `${today} · ${time}` : time;
}

export default function History() {
  const { copy, preferences } = useApp();
  const { colors } = useTheme();
  const recents = useSyncExternalStore(subscribeRecents, getRecents);
  const trailing = recents.length ? <Pressable accessibilityRole="button" accessibilityLabel={copy.history.clear}
    onPress={() => clearRecents()} hitSlop={12} android_ripple={{ color: colors.outline }}
    style={styles.clearHit}><IconTrash size={18} /></Pressable> : undefined;
  return <AppScreen title={copy.history.title} trailing={trailing}>
    {recents.length === 0 ? <View style={styles.empty}>
      <SectionHeading>{copy.history.empty}</SectionHeading>
      <Txt tone="muted" style={type.caption}>{copy.history.emptyDetail}</Txt>
    </View> : <View style={styles.list}>
      {recents.map(entry => <CallHistoryRow key={entry.id} number={entry.number}
        when={timeLabel(entry.at, copy.history.today)}
        onOpen={() => void Engine.launchWhatsAppTest(entry.number, preferences?.whatsappTarget === 'business')} />)}
      <View style={styles.footerRow}>
        <Txt tone="muted" style={type.small}>{copy.history.session}</Txt>
        <Pressable accessibilityRole="button" accessibilityLabel={copy.history.clear} onPress={() => clearRecents()}
          hitSlop={12} style={styles.clearHit}><IconTrash size={16} /></Pressable>
      </View>
    </View>}
  </AppScreen>;
}

const styles = StyleSheet.create({
  empty: { gap: 8, alignItems: 'center', paddingVertical: 48 },
  list: { borderRadius: 20, overflow: 'hidden' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  clearHit: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
