import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { addLog, makeId, colors } from './lib';

const FLOWS = ['light', 'medium', 'heavy'];

export default function LogScreen({ navigation }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [flow, setFlow] = useState('medium');
  const [symptoms, setSymptoms] = useState('');
  const onSave = async () => {
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(date)) {
      Alert.alert('Invalid date', 'Use YYYY-MM-DD format.');
      return;
    }
    await addLog({ id: makeId(), date, flow, symptoms: symptoms.trim() });
    setSymptoms('');
    Alert.alert('Saved', 'Your log has been added.');
    navigation.navigate('Home');
  };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-01-15" autoCapitalize="none" />
      <Text style={styles.label}>Flow</Text>
      <View style={styles.flowRow}>
        {FLOWS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFlow(f)} style={[styles.flowBtn, flow === f && styles.flowBtnActive]}>
            <Text style={[styles.flowText, flow === f && styles.flowTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Symptoms (optional)</Text>
      <TextInput style={[styles.input, { height: 90 }]} value={symptoms} onChangeText={setSymptoms} placeholder="cramps, headache, fatigue..." multiline />
      <TouchableOpacity style={styles.save} onPress={onSave}><Text style={styles.saveText}>Save log</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontSize: 14, color: colors.text },
  flowRow: { flexDirection: 'row', gap: 10 },
  flowBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  flowBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  flowText: { fontSize: 13, color: colors.text, textTransform: 'capitalize' },
  flowTextActive: { color: '#fff', fontWeight: '700' },
  save: { marginTop: 28, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
