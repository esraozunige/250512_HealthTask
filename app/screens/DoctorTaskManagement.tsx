import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
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
      // Fetch all task templates created by this doctor
      const { data: templates, error: templateError } = await supabase
        .from('task_templates')
        .select('*')
        .eq('doctor_id', user.id);
      if (templateError) throw templateError;
      // Fetch all group_ids where the doctor is a member
      const { data: doctorGroups, error: doctorGroupsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .eq('role', 'doctor');
      if (doctorGroupsError) throw doctorGroupsError;
      const groupIds = (doctorGroups || []).map(g => g.group_id);
      // Fetch all patient ids in these groups
      const { data: members, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .in('group_id', groupIds)
        .eq('role', 'patient');
      if (memberError) throw memberError;
      const patientIds = (members || []).map(m => m.user_id);
      // For each template, count the number of assignments in tasks
      const tasksWithCounts = await Promise.all((templates || [])
        .filter(template => template.title && template.title.trim() !== '')
        .map(async (template) => {
          // Fetch all assignments for this template and doctor with status not 'suspended'
          const { data: assignments, error: countError } = await supabase
            .from('tasks')
            .select('assigned_to, status')
            .eq('template_id', template.id)
            .eq('assigned_by', user.id)
            .neq('status', 'suspended');
          // Count unique patients (assigned_to) who are in patientIds
          const uniquePatientIds = new Set(
            (assignments || [])
              .filter(a => patientIds.includes(a.assigned_to))
              .map(a => a.assigned_to)
          );
          return {
            id: template.id,
            icon: template.icon,
            title: template.title,
            description: template.description,
            patientCount: uniquePatientIds.size,
            iconBgColor: '#E6EBFF',
          };
        }));
      setTasks(tasksWithCounts);
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
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 65 }]}> 
        <Text style={styles.headerTitle}>Task Management</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="person-circle" size={32} color="white" />
        </TouchableOpacity>
      </View>
      <SafeAreaView style={{ flex: 1 }}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0, // will be set dynamically
    paddingBottom: 20,
    backgroundColor: '#4A6FFF',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  headerIcon: { marginLeft: 12 },
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