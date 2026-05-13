import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { getGoals, saveGoals, Goals } from '../../services/goalService';

const EXERCISE_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const SLEEP_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9];

export default function SettingsScreen() {
  const { user } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [nameInput, setNameInput] = useState(user?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);

  const [goals, setGoals] = useState<Goals>({ exerciseDaysPerWeek: null, minSleepHours: null });
  const [savingGoals, setSavingGoals] = useState(false);

  useEffect(() => {
    if (!user) return;
    getGoals(user.uid).then(setGoals);
  }, [user]);

  async function handleSaveName() {
    if (!user) return;
    setSavingName(true);
    try {
      const trimmed = nameInput.trim();
      await updateProfile(user, { displayName: trimmed || null });
      setDisplayName(trimmed);
      setEditingName(false);
    } catch {
      Alert.alert('Error', 'Could not update name. Try again.');
    } finally {
      setSavingName(false);
    }
  }

  function handleCancelName() {
    setNameInput(displayName);
    setEditingName(false);
  }

  async function handleGoalChange(update: Partial<Goals>) {
    if (!user) return;
    const updated = { ...goals, ...update };
    setGoals(updated);
    setSavingGoals(true);
    try {
      await saveGoals(user.uid, updated);
    } catch {
      Alert.alert('Error', 'Could not save goal. Try again.');
    } finally {
      setSavingGoals(false);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.card}>
          <Text style={styles.rowLabel}>Display Name</Text>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                placeholder="Your name"
                placeholderTextColor="#7BA3C8"
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <TouchableOpacity onPress={handleSaveName} disabled={savingName} style={styles.saveBtn}>
                {savingName
                  ? <ActivityIndicator size="small" color="#2563EB" />
                  : <Text style={styles.saveBtnText}>Save</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancelName} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.displayRow}>
              <Text style={styles.rowValue}>
                {displayName || <Text style={styles.rowValueMuted}>Not set</Text>}
              </Text>
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[styles.card, { marginTop: 10 }]}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>Weekly Goals</Text>
          {savingGoals && <ActivityIndicator size="small" color="#7BA3C8" style={{ marginBottom: 8 }} />}
        </View>

        <View style={styles.card}>
          <Text style={styles.rowLabel}>Exercise — days per week</Text>
          <View style={styles.chipRow}>
            {EXERCISE_OPTIONS.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.chip, goals.exerciseDaysPerWeek === n && styles.chipActive]}
                onPress={() => handleGoalChange({
                  exerciseDaysPerWeek: goals.exerciseDaysPerWeek === n ? null : n,
                })}
              >
                <Text style={[styles.chipText, goals.exerciseDaysPerWeek === n && styles.chipTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.card, { marginTop: 10 }]}>
          <Text style={styles.rowLabel}>Sleep — minimum hours per night</Text>
          <View style={styles.chipRow}>
            {SLEEP_OPTIONS.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.chip, goals.minSleepHours === n && styles.chipActive]}
                onPress={() => handleGoalChange({
                  minSleepHours: goals.minSleepHours === n ? null : n,
                })}
              >
                <Text style={[styles.chipText, goals.minSleepHours === n && styles.chipTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D2D3A',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 12,
    color: '#7BA3C8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: '#7BA3C8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  rowValue: {
    fontSize: 15,
    color: '#2D2D3A',
    flex: 1,
  },
  rowValueMuted: {
    color: '#aaa',
    fontStyle: 'italic',
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editLink: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    backgroundColor: '#E8F1FB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 15,
    color: '#2D2D3A',
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  saveBtnText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelBtn: {
    paddingHorizontal: 4,
    paddingVertical: 7,
  },
  cancelBtnText: {
    color: '#7BA3C8',
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#E8F1FB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: '#2563EB',
  },
  chipText: {
    fontSize: 14,
    color: '#2D2D3A',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  signOutBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF8FAB',
  },
  signOutText: {
    color: '#FF8FAB',
    fontSize: 15,
    fontWeight: '600',
  },
});
