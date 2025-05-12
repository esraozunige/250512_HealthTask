import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { streakService, StreakUpdate } from '../services/streakService';
import { useAuth } from '../context/AuthContext';

export const StreakDisplay: React.FC = () => {
  const { user } = useAuth();
  const [streakInfo, setStreakInfo] = useState<StreakUpdate | null>(null);

  useEffect(() => {
    const loadStreakInfo = async () => {
      if (user) {
        try {
          const info = await streakService.getStreakStatus(user.id);
          setStreakInfo(info);
        } catch (error) {
          console.error('Error loading streak info:', error);
        }
      }
    };

    loadStreakInfo();
  }, [user]);

  if (!streakInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.streakContainer}>
        <Text style={styles.label}>Current Streak</Text>
        <Text style={styles.value}>{streakInfo.current_streak}</Text>
      </View>
      <View style={styles.streakContainer}>
        <Text style={styles.label}>Longest Streak</Text>
        <Text style={styles.value}>{streakInfo.longest_streak}</Text>
      </View>
      <View style={[
        styles.statusContainer,
        streakInfo.status === 'NeedsHelp' ? styles.needsHelp : styles.active
      ]}>
        <Text style={styles.statusText}>{streakInfo.status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  active: {
    backgroundColor: '#E8F5E9',
  },
  needsHelp: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 