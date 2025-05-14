import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTaskContext, Task } from '../context/TaskContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientManageTasks'>;

const PatientManageTasks = () => {
  const navigation = useNavigation<NavigationProp>();
  const { tasks, updateTask } = useTaskContext();
  const [activeFilter, setActiveFilter] = useState<'all' | 'self' | 'doctor'>('all');

  const filteredTasks = tasks
    .filter(task => (task.status === 'pending' || task.status === 'completed'))
    .filter(task => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'self') return task.assignedBy === 'Self-assigned';
      return task.assignedBy !== 'Self-assigned';
    });

  const handleCreateTask = () => {
    navigation.navigate('PatientCreateTask', {});
  };

  const handleEditTask = (task: Task) => {
    navigation.navigate('PatientCreateTask', { task });
  };

  const renderTask = (task: Task) => (
    <View key={task.id} style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskIcon}>{task.icon}</Text>
        <View style={styles.frequencyBadge}>
          <Text style={styles.frequencyText}>{task.frequency}</Text>
        </View>
      </View>

      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDescription}>{task.description}</Text>

      <View style={styles.assignedByContainer}>
        <Ionicons name="person-outline" size={16} color="#666" />
        <Text style={styles.assignedByText}>{task.assignedBy}</Text>
      </View>

      {task.status === 'completed' ? (
        <View style={styles.completedStatus}>
          <View style={styles.statusLeft}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.completedStatusText}>Completed today</Text>
          </View>
          <View style={styles.statusRight}>
            <Text style={styles.secretsText}>Secrets safe</Text>
          </View>
        </View>
      ) : (
        <View style={styles.pendingStatus}>
          <View style={styles.statusLeft}>
            <Ionicons name="time" size={20} color="#fff" />
            <Text style={styles.pendingStatusText}>Due in {task.dueIn}</Text>
          </View>
          <View style={styles.statusRight}>
            <Ionicons name="lock-closed" size={16} color="#fff" />
            <Text style={styles.riskText}>Risk: {task.risk} secret</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Manage Tasks</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              All Tasks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'self' && styles.activeFilter]}
            onPress={() => setActiveFilter('self')}
          >
            <Text style={[styles.filterText, activeFilter === 'self' && styles.activeFilterText]}>
              Self-assigned
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'doctor' && styles.activeFilter]}
            onPress={() => setActiveFilter('doctor')}
          >
            <Text style={[styles.filterText, activeFilter === 'doctor' && styles.activeFilterText]}>
              Doctor-assigned
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.addTaskButton}
          onPress={handleCreateTask}
        >
          <Ionicons name="add-circle-outline" size={24} color="#E86D6D" />
          <Text style={styles.addTaskText}>Add New Self-assigned Task</Text>
        </TouchableOpacity>

        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Your Tasks</Text>
          {filteredTasks.map(renderTask)}
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeFilter: {
    backgroundColor: '#E86D6D',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E86D6D',
    borderStyle: 'dashed',
  },
  addTaskText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#E86D6D',
    fontWeight: '500',
  },
  tasksSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskIcon: {
    fontSize: 24,
  },
  frequencyBadge: {
    backgroundColor: '#F5F7FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    color: '#4A6FFF',
    fontSize: 14,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  assignedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignedByText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  completedStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  pendingStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E86D6D',
    padding: 12,
    borderRadius: 8,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedStatusText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  pendingStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  secretsText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  riskText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default PatientManageTasks; 