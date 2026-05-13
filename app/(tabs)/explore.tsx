import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getRecentEntries, HabitEntry } from '../../services/habitService';
import { getGoals, Goals } from '../../services/goalService';

type Entry = HabitEntry & { date: string };

const MOOD_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄'];

export default function InsightsScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [goals, setGoals] = useState<Goals>({ exerciseDaysPerWeek: null, minSleepHours: null });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      Promise.all([
        getRecentEntries(user.uid, 30),
        getGoals(user.uid),
      ]).then(([data, g]) => {
        setEntries(data);
        setGoals(g);
        setLoading(false);
      });
    }, [user])
  );

  // entries is sorted newest-first; get the 7 most recent reversed for charting
  const recent7 = entries.slice(0, 7).slice().reverse();

  const streak = (() => {
    if (entries.length === 0) return 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let startOffset = -1;
    if (entries[0]?.date === today) startOffset = 0;
    else if (entries[0]?.date === yesterday) startOffset = 1;
    else return 0;
    let count = 0;
    for (let i = 0; i < entries.length; i++) {
      const expected = new Date(Date.now() - (startOffset + i) * 86400000).toISOString().split('T')[0];
      if (entries[i]?.date === expected) count++;
      else break;
    }
    return count;
  })();

  const sleepEntries = entries.slice(0, 7).filter(e => e.sleep != null);
  const avgSleep = sleepEntries.length > 0
    ? (sleepEntries.reduce((s, e) => s + (e.sleep ?? 0), 0) / sleepEntries.length).toFixed(1)
    : null;

  const exerciseDays = entries.slice(0, 7).filter(e => e.exercise === true).length;
  const totalDaysWithData = entries.slice(0, 7).filter(e => e.exercise != null).length;

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
        <Text style={{ fontSize: 48, marginBottom: 12 }}>📊</Text>
        <Text style={styles.emptyText}>No data yet</Text>
        <Text style={styles.muted}>Log a few days on the Today tab to see your trends.</Text>
      </View>
    );
  }

  const hasMoodData = recent7.some(e => e.mood != null);
  const hasSleepData = recent7.some(e => e.sleep != null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your wellness trends</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak 🔥</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{avgSleep ?? '—'}</Text>
          <Text style={styles.statLabel}>Avg Sleep 🌙</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {totalDaysWithData > 0 ? `${exerciseDays}/${totalDaysWithData}` : '—'}
          </Text>
          <Text style={styles.statLabel}>Active Days 🏃</Text>
        </View>
      </View>

      {hasMoodData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood — Last 7 Days</Text>
          <View style={styles.chart}>
            {recent7.map(entry => {
              const barH = entry.mood != null ? Math.round((entry.mood / 5) * 80) : 0;
              const day = new Date(entry.date + 'T00:00:00')
                .toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <View key={entry.date} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    {entry.mood != null && (
                      <View style={[styles.barMood, { height: barH }]} />
                    )}
                  </View>
                  {entry.mood != null && (
                    <Text style={styles.barEmoji}>{MOOD_EMOJI[entry.mood]}</Text>
                  )}
                  <Text style={styles.barDay}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {hasSleepData && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sleep — Last 7 Days</Text>
          <View style={styles.chart}>
            {recent7.map(entry => {
              const barH = entry.sleep != null ? Math.round((entry.sleep / 10) * 80) : 0;
              const day = new Date(entry.date + 'T00:00:00')
                .toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <View key={entry.date} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    {entry.sleep != null && (
                      <View style={[styles.barSleep, { height: barH }]} />
                    )}
                  </View>
                  {entry.sleep != null && (
                    <Text style={styles.barValue}>{entry.sleep}h</Text>
                  )}
                  <Text style={styles.barDay}>{day}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartNote}>10h max reference</Text>
        </View>
      )}

      {(goals.exerciseDaysPerWeek != null || goals.minSleepHours != null) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week's Goals</Text>

          {goals.exerciseDaysPerWeek != null && (() => {
            const done = entries.slice(0, 7).filter(e => e.exercise === true).length;
            const target = goals.exerciseDaysPerWeek!;
            const pct = Math.min(done / target, 1);
            const met = done >= target;
            return (
              <View style={styles.goalRow}>
                <View style={styles.goalLabelRow}>
                  <Text style={styles.goalLabel}>🏃 Exercise</Text>
                  <Text style={[styles.goalCount, met && styles.goalMet]}>
                    {done}/{target} days {met ? '✓' : ''}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct * 100}%` as any }, met && styles.progressMet]} />
                </View>
              </View>
            );
          })()}

          {goals.minSleepHours != null && (() => {
            const week = entries.slice(0, 7).filter(e => e.sleep != null);
            const done = week.filter(e => (e.sleep ?? 0) >= goals.minSleepHours!).length;
            const target = week.length;
            const pct = target > 0 ? Math.min(done / target, 1) : 0;
            const met = target > 0 && done === target;
            return (
              <View style={styles.goalRow}>
                <View style={styles.goalLabelRow}>
                  <Text style={styles.goalLabel}>🌙 Sleep ≥ {goals.minSleepHours}h</Text>
                  <Text style={[styles.goalCount, met && styles.goalMet]}>
                    {done}/{target} nights {met ? '✓' : ''}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct * 100}%` as any }, met && styles.progressMet]} />
                </View>
              </View>
            );
          })()}
        </View>
      )}

      {entries.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Gratitude</Text>
          {entries
            .filter(e => e.gratitude)
            .slice(0, 3)
            .map(e => (
              <View key={e.date} style={styles.gratitudeRow}>
                <Text style={styles.gratitudeDate}>
                  {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.gratitudeText}>"{e.gratitude}"</Text>
              </View>
            ))}
          {entries.filter(e => e.gratitude).length === 0 && (
            <Text style={styles.muted}>No gratitude notes yet.</Text>
          )}
        </View>
      )}
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 11,
    color: '#7BA3C8',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 14,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
  },
  barCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  barTrack: {
    width: 22,
    height: 80,
    backgroundColor: '#E8F1FB',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barMood: {
    width: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  barSleep: {
    width: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 6,
  },
  barEmoji: {
    fontSize: 12,
    marginTop: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#7BA3C8',
    marginTop: 3,
  },
  barDay: {
    fontSize: 10,
    color: '#7BA3C8',
    marginTop: 2,
  },
  chartNote: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'right',
  },
  goalRow: {
    marginBottom: 14,
  },
  goalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalLabel: {
    fontSize: 14,
    color: '#2D2D3A',
    fontWeight: '500',
  },
  goalCount: {
    fontSize: 13,
    color: '#7BA3C8',
    fontWeight: '500',
  },
  goalMet: {
    color: '#16A34A',
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E8F1FB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressMet: {
    backgroundColor: '#16A34A',
  },
  gratitudeRow: {
    marginBottom: 12,
  },
  gratitudeDate: {
    fontSize: 11,
    color: '#7BA3C8',
    marginBottom: 2,
  },
  gratitudeText: {
    fontSize: 14,
    color: '#2D2D3A',
    fontStyle: 'italic',
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
    textAlign: 'center',
  },
});
