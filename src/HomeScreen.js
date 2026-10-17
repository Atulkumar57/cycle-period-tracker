import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadLogs, deleteLog, computeCycleStats, colors } from './lib';

function CycleRing({ day, total, phase }) {
  if (day == null) return null;
  const size = 180;
  const pct = Math.min(day / total, 1);
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.arc, { width: size - 20, height: size - 20, borderRadius: (size - 20) / 2, borderColor: colors.primarySoft }]} />
      <View style={[styles.arc, { width: size - 20, height: size - 20, borderRadius: (size - 20) / 2, borderColor: colors.primary, borderTopColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: Math.floor(pct * 360) + 'deg' }] }]} />
      <View style={styles.center}>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.label}>day of cycle</Text>
        <Text style={styles.phase}>{phase}</Text>
      </View>
    </View>
  );
}

function LogItem({ log, onDelete }) {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <View style={{ flex: 1 }}>
        <Text style={styles.date}>{log.date}</Text>
        <Text style={styles.meta}>Flow: {log.flow || 'medium'}{log.symptoms ? ' - ' + log.symptoms : ''}</Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(log.id)}><Text style={styles.del}>X</Text></TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setLogs(await loadLogs());
    setRefreshing(false);
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const stats = computeCycleStats(logs);
  const phase = (() => {
    if (!stats.currentCycleDay) return 'No data';
    const d = stats.currentCycleDay;
    if (d <= 5) return 'Period';
    if (d <= 11) return 'Follicular';
    if (d <= 16) return 'Ovulation';
    return 'Luteal';
  })();
  const onDelete = async (id) => setLogs(await deleteLog(id));
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.subtitle}>
        {stats.daysUntilNext == null ? 'Log your first period to see predictions' : stats.daysUntilNext >= 0 ? 'Next period in ' + stats.daysUntilNext + ' day(s)' : 'Period expected ' + Math.abs(stats.daysUntilNext) + ' day(s) ago'}
      </Text>
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <CycleRing day={stats.currentCycleDay} total={stats.avgCycleLength} phase={phase} />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cycle insights</Text>
        <Row label="Average cycle" value={stats.avgCycleLength + ' days'} />
        <Row label="Last period" value={stats.lastPeriodStart || '-'} />
        <Row label="Predicted next" value={stats.nextPeriod || '-'} />
        <Row label="Fertile window" value={stats.fertileStart ? stats.fertileStart + ' to ' + stats.fertileEnd : '-'} />
      </View>
      <Text style={styles.section}>Recent logs</Text>
      {logs.length === 0 ? (
        <Text style={styles.empty}>No logs yet. Tap Log to add one.</Text>
      ) : (
        [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((l) => <LogItem key={l.id} log={l} onDelete={onDelete} />)
      )}
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.rowJustify}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4 },
  wrap: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  arc: { position: 'absolute', borderWidth: 8 },
  center: { alignItems: 'center' },
  day: { fontSize: 42, fontWeight: '800', color: colors.primary },
  label: { fontSize: 12, color: colors.muted },
  phase: { marginTop: 6, fontSize: 12, fontWeight: '600', color: colors.text },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 },
  rowJustify: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: colors.muted },
  rowValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginRight: 12 },
  date: { fontSize: 14, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  del: { fontSize: 16, color: colors.muted, paddingHorizontal: 6 },
  section: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 24, marginBottom: 8 },
  empty: { fontSize: 13, color: colors.muted },
});
