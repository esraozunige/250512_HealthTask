import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import DoctorBottomNav from '../components/DoctorBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DoctorTaskManagementRouteProp = RouteProp<RootStackParamList, 'DoctorTaskManagement'>;

interface Task {
  id: string;
  icon: string;
  title: string;
  description: string;
  patientCount: number;
  iconBgColor: string;
}

const initialTaskTemplates: Task[] = [
  {
    id: '1',
    icon: 'medical',
    title: 'Daily Medication',
    description: 'Take prescribed medication',
    patientCount: 0,
    iconBgColor: '#E6EBFF',
  },
  {
    id: '2',
    icon: 'walk',
    title: 'Daily Walk',
    description: 'Walk at least 8,000 steps',
    patientCount: 0,
    iconBgColor: '#E8F5E9',
  },
  {
    id: '3',
    icon: 'time',
    title: 'Blood Pressure Check',
    description: 'Record daily blood pressure',
    patientCount: 0,
    iconBgColor: '#FFEBEE',
  },
  {
    id: '4',
    icon: 'lock-closed',
    title: 'Meditation Session',
    description: '10 minutes of guided meditation',
    patientCount: 0,
    iconBgColor: '#F3E5F5',
  },
];

const DoctorTaskManagement = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DoctorTaskManagementRouteProp>();
  const [taskTemplates, setTaskTemplates] = useState<Task[]>(initialTaskTemplates);

  useEffect(() => {
    if (route.params?.updatedTask) {
      const updatedTask = route.params.updatedTask as Task;
      setTaskTemplates(prevTemplates =>
        prevTemplates.map(template =>
          template.id === updatedTask.id ? { ...template, patientCount: updatedTask.patientCount } : template
        )
      );
    }
  }, [route.params?.updatedTask]);

  const stats = {
    activeTasks: taskTemplates.filter(task => task.patientCount > 0).length,
    completionRate: '78%',
  };

  const handleAddTask = () => {
    navigation.navigate('DoctorCreateTask');
  };

  const handleAssignTask = (task: Task) => {
    navigation.navigate('DoctorAssignTask', { task });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Management</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={32} color="white" />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: '#F5F7FF' }]}>
            <Text style={styles.statLabel}>Active Tasks</Text>
            <Text style={styles.statValue}>{stats.activeTasks}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#F0F9F0' }]}>
            <Text style={styles.statLabel}>Completion Rate</Text>
            <Text style={styles.statValue}>{stats.completionRate}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.createTaskButton}
          onPress={handleAddTask}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.createTaskText}>Create Task</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Task Templates</Text>

        {taskTemplates.map(template => (
          <View key={template.id} style={styles.templateCard}>
            <View style={[styles.templateIcon, { backgroundColor: template.iconBgColor }]}>
              <Ionicons name={template.icon as any} size={24} color="#4A6FFF" />
            </View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateTitle}>{template.title}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
            </View>
            <TouchableOpacity 
              style={styles.patientCountButton}
              onPress={() => handleAssignTask(template)}
            >
              <Text style={styles.patientCount}>{template.patientCount}</Text>
              <Text style={styles.patientCountLabel}>patients</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <DoctorBottomNav activeTab="Tasks" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#4A6FFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  createTaskButton: {
    backgroundColor: '#4A6FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    marginBottom: 24,
    gap: 8,
  },
  createTaskText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666666',
  },
  patientCountButton: {
    alignItems: 'center',
  },
  patientCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6FFF',
  },
  patientCountLabel: {
    fontSize: 12,
    color: '#4A6FFF',
  },
});

export default DoctorTaskManagement; 