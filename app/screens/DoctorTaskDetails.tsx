import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import DoctorBottomNav from '../components/DoctorBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorTaskDetails'>;
type RouteProps = RouteProp<RootStackParamList, 'DoctorTaskDetails'>;

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
  proof_type: string;
};

type Submission = {
  id: string;
  task_id: string;
  submitted_by: string;
  proof_type: string;
  proof_url: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const DoctorTaskDetails = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { taskId } = route.params;

  const [task, setTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskDetails();
    fetchSubmissions();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          patient:assigned_to (
            full_name
          )
        `)
        .eq('id', taskId)
        .single();

      if (fetchError) throw fetchError;

      setTask({
        ...data,
        patient_name: data.patient?.full_name || 'Unknown Patient',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      Alert.alert('Error', 'Failed to fetch submissions');
    }
  };

  const handleStatusToggle = async () => {
    if (!task) return;

    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (updateError) throw updateError;

      setTask(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: deleteError } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

              if (deleteError) throw deleteError;

              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ],
    );
  };

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({ status: 'approved' })
        .eq('id', submissionId);

      if (error) throw error;

      // Refresh submissions
      fetchSubmissions();
    } catch (err) {
      Alert.alert('Error', 'Failed to approve submission');
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('task_submissions')
        .update({ status: 'rejected' })
        .eq('id', submissionId);

      if (error) throw error;

      // Refresh submissions
      fetchSubmissions();
    } catch (err) {
      Alert.alert('Error', 'Failed to reject submission');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#34A853';
      case 'rejected':
        return '#EA4335';
      case 'pending':
        return '#F7B731';
      default:
        return '#666';
    }
  };

  const renderSubmissionItem = ({ item }: { item: Submission }) => (
    <View style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <Text style={styles.submissionDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}20` },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.proofType}>Proof Type: {item.proof_type}</Text>
      {item.notes && (
        <Text style={styles.notes}>Notes: {item.notes}</Text>
      )}

      {item.status === 'pending' && (
        <View style={styles.submissionActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveSubmission(item.id)}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectSubmission(item.id)}
          >
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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

  if (error || !task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Task not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTaskDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteTask}
          >
            <Ionicons name="trash-outline" size={24} color="#E86D6D" />
          </TouchableOpacity>
        </View>

        <View style={styles.taskInfo}>
          <View style={styles.taskHeader}>
            <View style={styles.taskIcon}>
              <Ionicons name="calendar" size={24} color="#E86D6D" />
            </View>
            <View style={styles.taskMeta}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.patientName}>
                Assigned to: {task.patient_name}
              </Text>
            </View>
          </View>

          <View style={styles.taskDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {task.frequency} at {task.due_date}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                Proof required: {task.proof_type}
              </Text>
            </View>
            {task.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description:</Text>
                <Text style={styles.descriptionText}>{task.description}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.submissionsSection}>
          <Text style={styles.sectionTitle}>Submissions</Text>
          {submissions.length === 0 ? (
            <View style={styles.emptySubmissions}>
              <Text style={styles.emptyText}>No submissions yet</Text>
            </View>
          ) : (
            submissions.map((submission) => (
              <View key={submission.id}>
                {renderSubmissionItem({ item: submission })}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <DoctorBottomNav activeTab="Tasks" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  content: {
    flex: 1,
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  deleteButton: {
    padding: 8,
  },
  taskInfo: {
    padding: 20,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskMeta: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 14,
    color: '#666',
  },
  taskDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  descriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  submissionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptySubmissions: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  submissionCard: {
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
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  submissionDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  approvedBadge: {
    backgroundColor: '#e6f4ea',
  },
  rejectedBadge: {
    backgroundColor: '#fce8e6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  proofType: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  submissionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#34a853',
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#ea4335',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
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
});

export default DoctorTaskDetails; 