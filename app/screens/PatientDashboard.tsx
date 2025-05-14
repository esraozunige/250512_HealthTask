import React from 'react';
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
import PatientBottomNav from '../components/PatientBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientDashboard'>;

type TaskSubmitProofParams = {
  id: string;
  icon: string;
  title: string;
  description: string;
  frequency: string;
  assignedBy: string;
  dueIn: string;
  risk: number;
  status: 'pending' | 'completed';
};

const PatientDashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const { tasks, toggleTaskStatus } = useTaskContext();
  const filteredTasks = tasks.filter(task => task.status === 'pending' || task.status === 'completed');

  const renderTask = (task: Task) => {
    const isCompleted = task.status === 'completed';
    const statusStyle = isCompleted ? styles.completedStatus : styles.pendingStatus;
    const statusText = isCompleted ? 'Completed today' : `Due in ${task.dueIn || 'soon'}`;
    const riskText = task.risk ? `Risk: ${task.risk} secret` : 'Secrets safe';

    const taskForSubmitProof: TaskSubmitProofParams = {
      id: task.id,
      icon: task.icon,
      title: task.title,
      description: task.description,
      frequency: task.frequency,
      assignedBy: task.assignedBy,
      dueIn: task.dueIn || 'soon',
      risk: task.risk || 0,
      status: task.status,
    };

    return (
      <View key={task.id} style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskIcon}>{task.icon}</Text>
          <Text style={styles.taskFrequency}>{task.frequency}</Text>
        </View>
        
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskDescription}>{task.description}</Text>
        
        <View style={styles.taskAssignedBy}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.assignedByText}>{task.assignedBy}</Text>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => navigation.navigate('PatientSubmitProof', { task: taskForSubmitProof })}
          >
            <Text style={styles.submitButtonText}>Submit Proof</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.taskStatus, statusStyle]}
          onPress={() => toggleTaskStatus(task.id)}
        >
          <View style={styles.statusLeft}>
            {isCompleted ? (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            ) : (
              <Ionicons name="time" size={20} color="#fff" />
            )}
            <Text style={[styles.statusText, isCompleted && styles.completedText]}>
              {statusText}
            </Text>
          </View>
          <View style={styles.statusRight}>
            {!isCompleted && <Ionicons name="lock-closed" size={16} color="#fff" />}
            <Text style={[styles.riskText, isCompleted && styles.completedText]}>
              {riskText}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, Deen</Text>
          <Text style={styles.subtitle}>Keep up the good work!</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profilePic} onPress={() => navigation.navigate('PatientSettings')}>
            <Ionicons name="person-circle-outline" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Your Health Tasks</Text>
        {filteredTasks.map(renderTask)}
      </ScrollView>
      <PatientBottomNav activeTab="Dashboard" />
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    padding: 4,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
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
    marginBottom: 8,
  },
  taskIcon: {
    fontSize: 24,
  },
  taskFrequency: {
    fontSize: 14,
    color: '#4A6FFF',
    backgroundColor: '#F5F7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  taskAssignedBy: {
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
  submitButton: {
    backgroundColor: '#fff',
  },
  submitButtonText: {
    color: '#4A6FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  taskStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  pendingStatus: {
    backgroundColor: '#E86D6D',
  },
  completedStatus: {
    backgroundColor: '#E8F5E9',
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
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  riskText: {
    color: '#fff',
    fontSize: 14,
  },
  completedText: {
    color: '#4CAF50',
  },
});

export default PatientDashboard; 