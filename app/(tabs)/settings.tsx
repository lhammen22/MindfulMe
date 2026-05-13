import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const { user } = useAuth();

  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [nameInput, setNameInput] = useState(user?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);

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

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(auth),
      },
    ]);
  }

  return (
    <View style={styles.container}>
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
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: 6,
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
