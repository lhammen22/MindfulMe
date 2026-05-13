import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { saveEntry, getEntry, getRecentEntries, todayKey } from '../../services/habitService';
import { generateAffirmation } from '../../services/claude';
import AffirmationCard from '../../components/AffirmationCard';
import MoodPicker from '../../components/MoodPicker';
import HabitCard, { ToggleButton } from '../../components/HabitCard';

export default function TodayScreen() {
  const { user } = useAuth();

  const [affirmation, setAffirmation] = useState('');
  const [affirmationLoading, setAffirmationLoading] = useState(true);

  const [mood, setMood] = useState<number | null>(null);
  const [sleep, setSleep] = useState('');
  const [exercise, setExercise] = useState<boolean | null>(null);
  const [gratitude, setGratitude] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      loadToday();
    }, [user])
  );

  async function loadToday() {
    if (!user) return;
    const entry = await getEntry(user.uid, todayKey());
    if (entry) {
      setMood(entry.mood);
      setSleep(entry.sleep != null ? String(entry.sleep) : '');
      setExercise(entry.exercise);
      setGratitude(entry.gratitude || '');
      if (entry.affirmation) {
        setAffirmation(entry.affirmation);
        setAffirmationLoading(false);
        return;
      }
    }
    loadAffirmation();
  }

  async function loadAffirmation() {
    if (!user) return;
    setAffirmationLoading(true);
    try {
      const recent = await getRecentEntries(user.uid, 7);
      const text = await generateAffirmation(
        recent.map(r => ({
          date: r.date,
          mood: r.mood ?? undefined,
          sleep: r.sleep ?? undefined,
          exercise: r.exercise ?? undefined,
          gratitude: r.gratitude || undefined,
        }))
      );
      setAffirmation(text);
      await saveEntry(user.uid, todayKey(), { affirmation: text });
    } finally {
      setAffirmationLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await saveEntry(user.uid, todayKey(), {
        mood,
        sleep: sleep ? parseFloat(sleep) : null,
        exercise,
        gratitude,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      Alert.alert('Error', 'Could not save. Check your connection.');
    } finally {
      setSaving(false);
    }
  }

  const greeting = () => {
    const h = new Date().getHours();
    const base = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return user?.displayName ? `${base}, ${user.displayName}` : base;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()} 🌿</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>

        <AffirmationCard text={affirmation} loading={affirmationLoading} />

        <View style={styles.section}>
          <HabitCard title="Mood" icon="💭">
            <MoodPicker value={mood} onChange={setMood} />
          </HabitCard>

          <HabitCard title="Sleep" icon="🌙">
            <TextInput
              style={styles.sleepInput}
              placeholder="Hours slept (e.g. 7.5)"
              placeholderTextColor="#7BA3C8"
              keyboardType="decimal-pad"
              value={sleep}
              onChangeText={setSleep}
            />
          </HabitCard>

          <HabitCard title="Exercise" icon="🏃">
            <View style={{ flexDirection: 'row' }}>
              <ToggleButton label="Yes" active={exercise === true} onPress={() => setExercise(true)} />
              <ToggleButton label="No" active={exercise === false} onPress={() => setExercise(false)} />
            </View>
          </HabitCard>

          <HabitCard title="Gratitude" icon="🙏">
            <TextInput
              style={styles.gratitudeInput}
              placeholder="What are you grateful for today?"
              placeholderTextColor="#7BA3C8"
              multiline
              numberOfLines={3}
              value={gratitude}
              onChangeText={setGratitude}
            />
          </HabitCard>
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Today\'s Entry'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D2D3A',
  },
  date: {
    fontSize: 14,
    color: '#7BA3C8',
    marginTop: 2,
  },
  section: {
    marginTop: 16,
  },
  sleepInput: {
    backgroundColor: '#E8F1FB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#2D2D3A',
  },
  gratitudeInput: {
    backgroundColor: '#E8F1FB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#2D2D3A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
