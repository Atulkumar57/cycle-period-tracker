import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInCalendarDays, parseISO, addDays, format } from 'date-fns';

export const colors = {
  bg: '#FFF5F8',
  card: '#FFFFFF',
  primary: '#E94E77',
  primarySoft: '#FFD6E2',
  text: '#2B2B2B',
  muted: '#8A8A8A',
  border: '#F0D5DD',
  success: '#3FAE7A',
};

const KEY = '@cycle_logs_v1';

export async function loadLogs() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function saveLogs(logs) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(logs));
  } catch (e) {}
}

export async function addLog(log) {
  const logs = await loadLogs();
  const next = [...logs, log].sort((a, b) => a.date.localeCompare(b.date));
  await saveLogs(next);
  return next;
}

export async function deleteLog(id) {
  const logs = await loadLogs();
  const next = logs.filter((l) => l.id !== id);
  await saveLogs(next);
  return next;
}

export const DEFAULT_CYCLE_LENGTH = 28;

export function computeCycleStats(logs) {
  if (!logs || logs.length === 0) {
    return {
      lastPeriodStart: null,
      avgCycleLength: DEFAULT_CYCLE_LENGTH,
      nextPeriod: null,
      currentCycleDay: null,
      fertileStart: null,
      fertileEnd: null,
      daysUntilNext: null,
    };
  }
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const starts = [sorted[0].date];
  for (let i = 1; i < sorted.length; i++) {
    const gap = differenceInCalendarDays(parseISO(sorted[i].date), parseISO(sorted[i - 1].date));
    if (gap > 10) starts.push(sorted[i].date);
  }
  let avgCycleLength = DEFAULT_CYCLE_LENGTH;
  if (starts.length >= 2) {
    const diffs = [];
    for (let i = 1; i < starts.length; i++) {
      diffs.push(differenceInCalendarDays(parseISO(starts[i]), parseISO(starts[i - 1])));
    }
    avgCycleLength = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
  }
  const lastPeriodStart = starts[starts.length - 1];
  const lastStartDate = parseISO(lastPeriodStart);
  const today = new Date();
  const nextPeriod = addDays(lastStartDate, avgCycleLength);
  const currentCycleDay = differenceInCalendarDays(today, lastStartDate) + 1;
  const daysUntilNext = differenceInCalendarDays(nextPeriod, today);
  const ovulationDay = avgCycleLength - 14;
  const fertileStart = addDays(lastStartDate, ovulationDay - 3);
  const fertileEnd = addDays(lastStartDate, ovulationDay + 3);
  return {
    lastPeriodStart,
    avgCycleLength,
    nextPeriod: format(nextPeriod, 'yyyy-MM-dd'),
    currentCycleDay,
    fertileStart: format(fertileStart, 'yyyy-MM-dd'),
    fertileEnd: format(fertileEnd, 'yyyy-MM-dd'),
    daysUntilNext,
  };
}

export function makeId() {
  return Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}
