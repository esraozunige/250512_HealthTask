import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import DoctorBottomNav from '../components/DoctorBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorTaskList'>;

type Task = {
  id: string;
  title: string;
  description: string;
  frequency: string;
  assigned_to: string;
  assigned_by: string;
  due_date: string;
  status: 'pending' | 'completed';
  created_at: string;
  patient_name: string;
};

const DoctorTaskList = () => {
  const navigation = useNavigation<NavigationProp>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          patient:assigned_to (
            full_name
          )
        `)
        .eq('assigned_by', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedTasks = data.map(task => ({
        ...task,
        patient_name: task.patient?.full_name || 'Unknown Patient',
      }));

      setTasks(formattedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('DoctorTaskDetails', { taskId: task.id });
  };

  const handleAddTask = () => {
    navigation.navigate('DoctorCreateTask');
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '#34A853';
      case 'pending':
        return '#F7B731';
      default:
        return '#666';
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => handleTaskPress(item)}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.taskDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.taskFooter}>
        <View style={styles.patientInfo}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.patientName}>{item.patient_name}</Text>
        </View>
        <Text style={styles.dueDate}>
          Due: {new Date(item.due_date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E86D6D" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTasks}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No tasks found</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleAddTask}>
              <Text style={styles.createButtonText}>Create New Task</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <DoctorBottomNav activeTab="Tasks" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E86D6D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#E86D6D',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E86D6D',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E86D6D',
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DoctorTaskList; 