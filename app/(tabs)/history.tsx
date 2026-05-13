import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getRecentEntries, HabitEntry } from '../../services/habitService';

type Entry = HabitEntry & { date: string };

const MOOD_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄'];

export default function HistoryScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      getRecentEntries(user.uid, 30).then(data => {
        setEntries(data);
        setLoading(false);
      });
    }, [user])
  );

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>No entries yet.</Text>
        <Text style={styles.muted}>Start logging on the Today tab!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Your History</Text>
        <Text style={styles.subtitle}>Last 30 days</Text>
      </View>

      {entries.map(entry => (
        <View key={entry.date} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
            {entry.mood != null && (
              <Text style={styles.moodEmoji}>{MOOD_EMOJI[entry.mood]}</Text>
            )}
          </View>

          <View style={styles.pills}>
            {entry.sleep != null && (
              <View style={styles.pill}>
                <Text style={styles.pillText}>🌙 {entry.sleep}h sleep</Text>
              </View>
            )}
            {entry.exercise != null && (
              <View style={[styles.pill, entry.exercise && styles.pillGreen]}>
                <Text style={styles.pillText}>{entry.exercise ? '🏃 Exercised' : '💤 Rest day'}</Text>
              </View>
            )}
          </View>

          {entry.affirmation ? (
            <Text style={styles.affirmation}>"{entry.affirmation}"</Text>
          ) : null}

          {entry.gratitude ? (
            <Text style={styles.gratitude}>🙏 {entry.gratitude}</Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  center: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D2D3A',
  },
  subtitle: {
    fontSize: 14,
    color: '#7BA3C8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D2D3A',
  },
  moodEmoji: {
    fontSize: 22,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  pill: {
    backgroundColor: '#E8F1FB',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillGreen: {
    backgroundColor: '#D4F5E9',
  },
  pillText: {
    fontSize: 12,
    color: '#2D2D3A',
  },
  affirmation: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#2563EB',
    marginBottom: 6,
  },
  gratitude: {
    fontSize: 13,
    color: '#555',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 6,
  },
  muted: {
    fontSize: 14,
    color: '#7BA3C8',
  },
});
