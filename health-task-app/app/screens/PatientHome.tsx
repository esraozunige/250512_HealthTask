import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import PatientBottomNav from '../components/PatientBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type DashboardStats = {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  upcomingDue: number;
};

const PatientHome = () => {
  const navigation = useNavigation<NavigationProp>();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    upcomingDue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      // Fetch total tasks
      const { count: totalTasks, error: totalError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id);

      if (totalError) throw totalError;

      // Fetch pending tasks
      const { count: pendingTasks, error: pendingError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Fetch completed tasks
      const { count: completedTasks, error: completedError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .eq('status', 'completed');

      if (completedError) throw completedError;

      // Fetch upcoming due tasks
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const { count: upcomingDue, error: upcomingError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .eq('status', 'pending')
        .gte('due_date', today.toISOString())
        .lte('due_date', nextWeek.toISOString());

      if (upcomingError) throw upcomingError;

      setStats({
        totalTasks: totalTasks || 0,
        pendingTasks: pendingTasks || 0,
        completedTasks: completedTasks || 0,
        upcomingDue: upcomingDue || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      Alert.alert('Error', 'Failed to fetch dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon="calendar"
            color="#4A6FFF"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon="time"
            color="#F7B731"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completedTasks}
            icon="checkmark-circle"
            color="#34A853"
          />
          <StatCard
            title="Upcoming Due"
            value={stats.upcomingDue}
            icon="warning"
            color="#E86D6D"
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PatientTaskList')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E86D6D20' }]}>
              <Ionicons name="calendar" size={24} color="#E86D6D" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Tasks</Text>
              <Text style={styles.actionDescription}>
                View and manage your tasks
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PatientProfile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4A6FFF20' }]}>
              <Ionicons name="person" size={24} color="#4A6FFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Profile</Text>
              <Text style={styles.actionDescription}>
                Update your profile information
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PatientBottomNav activeTab="Home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#E86D6D',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  statCard: {
    width: '50%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default PatientHome; 