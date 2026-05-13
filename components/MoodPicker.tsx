import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Rough' },
  { value: 2, emoji: '😕', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

type Props = {
  value: number | null;
  onChange: (v: number) => void;
};

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <View>
      <Text style={styles.label}>How are you feeling?</Text>
      <View style={styles.row}>
        {MOODS.map(m => (
          <TouchableOpacity
            key={m.value}
            style={[styles.btn, value === m.value && styles.selected]}
            onPress={() => onChange(m.value)}
          >
            <Text style={styles.emoji}>{m.emoji}</Text>
            <Text style={[styles.moodLabel, value === m.value && styles.selectedLabel]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#E8F1FB',
    width: 60,
  },
  selected: {
    backgroundColor: '#2563EB',
  },
  emoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 10,
    color: '#7BA3C8',
    marginTop: 4,
  },
  selectedLabel: {
    color: '#fff',
  },
});
