import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { loadLogs, computeCycleStats, colors } from './lib';

export default function CalendarScreen() {
  const [logs, setLogs] = useState([]);
  useFocusEffect(useCallback(() => { loadLogs().then(setLogs); }, []));
  const stats = computeCycleStats(logs);
  const marked = {};
  logs.forEach((l) => {
    marked[l.date] = { selected: true, selectedColor: colors.primary, selectedTextColor: '#fff' };
  });
  if (stats.fertileStart && stats.fertileEnd) {
    const start = new Date(stats.fertileStart);
    const end = new Date(stats.fertileEnd);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      if (!marked[key]) marked[key] = { marked: true, dotColor: colors.success };
    }
  }
  if (stats.nextPeriod) {
    marked[stats.nextPeriod] = { ...(marked[stats.nextPeriod] || {}), customStyles: { container: { borderWidth: 2, borderColor: colors.primary, borderRadius: 8 }, text: { color: colors.primary, fontWeight: '700' } } };
  }
  return (
    <View style={styles.screen}>
      <Calendar markingType="custom" markedDates={marked} theme={{ calendarBackground: colors.card, todayTextColor: colors.primary, arrowColor: colors.primary, monthTextColor: colors.text, textMonthFontWeight: '700' }} />
      <Text style={styles.note}>Predictions are based on your average cycle length of {stats.avgCycleLength} days.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  note: { fontSize: 12, color: colors.muted, marginTop: 16, lineHeight: 18 },
});
