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
import { supabase } from '../../lib/supabase';

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

const DoctorTaskManagement = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DoctorTaskManagementRouteProp>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');
      const { data, error } = await supabase
        .from('tasks')
        .select('id, icon, title, description, assigned_by')
        .eq('assigned_by', user.id);
      if (error) throw error;
      // Group by title/icon/description, count patients
      const grouped: { [key: string]: Task } = {};
      (data || []).forEach(task => {
        const key = `${task.title}|${task.icon}|${task.description}`;
        if (!grouped[key]) {
          grouped[key] = {
            id: task.id,
            icon: task.icon,
            title: task.title,
            description: task.description,
            patientCount: 1,
            iconBgColor: '#E6EBFF',
          };
        } else {
          grouped[key].patientCount += 1;
        }
      });
      setTasks(Object.values(grouped));
    } catch (err) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (route.params?.updatedTask) {
      fetchTasks();
    }
    // eslint-disable-next-line
  }, [route.params?.updatedTask]);

  const stats = {
    activeTasks: tasks.length,
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

        {loading ? (
          <Text>Loading...</Text>
        ) : tasks.length === 0 ? (
          <Text>No tasks found.</Text>
        ) : (
          tasks.map(template => (
            <View key={template.id} style={styles.templateCard}>
              <View style={[styles.templateIcon, { backgroundColor: template.iconBgColor || '#E6EBFF' }]}>
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
          ))
        )}
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