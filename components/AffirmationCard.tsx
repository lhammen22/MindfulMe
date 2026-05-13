import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  text: string;
  loading?: boolean;
};

export default function AffirmationCard({ text, loading }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Today's Affirmation</Text>
      {loading ? (
        <ActivityIndicator color="#2563EB" style={{ marginTop: 12 }} />
      ) : (
        <Text style={styles.text}>"{text}"</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontStyle: 'italic',
    lineHeight: 26,
    marginTop: 10,
  },
});
