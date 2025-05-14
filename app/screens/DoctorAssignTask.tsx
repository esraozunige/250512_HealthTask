import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import DoctorBottomNav from '../components/DoctorBottomNav';
import { Picker } from '@react-native-picker/picker';

type IconName = keyof typeof Ionicons.glyphMap;
type FrequencyType = 'Daily' | 'Weekly' | 'Monthly';
type ProofType = 'photo' | 'measurement' | 'confirmation';

interface Task {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  patientCount: number;
  iconBgColor: string;
}

interface Patient {
  id: string;
  name: string;
  image: string;
  age: number;
  status: 'assigned' | 'unassigned' | 'suspended';
  full_name: string;
}

type Notification = {
  patientName: string;
  type: 'assigned' | 'suspended';
  visible: boolean;
};

type DoctorAssignTaskRouteProp = RouteProp<RootStackParamList, 'DoctorAssignTask'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DoctorAssignTask = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DoctorAssignTaskRouteProp>();
  const task = route.params?.task as Task;

  const [frequency, setFrequency] = useState<FrequencyType>('Daily');
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmPm] = useState('AM');
  const [selectedProof, setSelectedProof] = useState<ProofType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      // Find all group_ids where the doctor is a member with role 'doctor'
      const { data: doctorGroups, error: doctorGroupsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .eq('role', 'doctor');
      if (doctorGroupsError) throw doctorGroupsError;
      const groupIds = (doctorGroups || []).map(g => g.group_id);
      if (!groupIds.length) {
        setPatients([]);
        setIsLoading(false);
        return;
      }

      // Fetch group members who are patients in these groups
      const { data: members, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .in('group_id', groupIds)
        .eq('role', 'patient');
      if (memberError) throw memberError;
      const patientIds = (members || []).map(m => m.user_id);
      if (!patientIds.length) {
        setPatients([]);
        setIsLoading(false);
        return;
      }

      // Fetch patient user details
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, full_name, email')
        .in('id', patientIds);
      if (userError) throw userError;
      setPatients(users?.map(patient => ({
        id: patient.id,
        name: patient.full_name,
        full_name: patient.full_name,
        image: '',
        age: 0,
        status: 'unassigned'
      })) || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      Alert.alert('Error', 'Failed to fetch patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFrequencySelect = (selected: FrequencyType) => {
    setFrequency(selected);
  };

  const handleProofSelect = (proof: ProofType) => {
    if (selectedProof.includes(proof)) {
      setSelectedProof(selectedProof.filter(p => p !== proof));
    } else {
      setSelectedProof([...selectedProof, proof]);
    }
  };

  const handlePatientAction = async (patient: Patient) => {
    const updatedPatients = patients.map(p => {
      if (p.id === patient.id) {
        const newStatus: 'assigned' | 'unassigned' | 'suspended' = p.status === 'assigned' ? 'suspended' : 'assigned';
        return { ...p, status: newStatus };
      }
      return p;
    });
    setPatients(updatedPatients);

    // Update task status in DB if suspending
    if (patient.status === 'assigned') {
      const user = await supabase.auth.user();
      if (!user) return;
      await supabase
        .from('tasks')
        .update({ status: 'suspended' })
        .eq('assigned_to', patient.id)
        .eq('assigned_by', user.id)
        .eq('status', 'pending');
    }

    setNotification({
      patientName: patient.name,
      type: patient.status === 'assigned' ? 'suspended' : 'assigned',
      visible: true,
    });
  };

  const handleSave = () => {
    // Count assigned patients
    const assignedPatientsCount = patients.filter(p => p.status === 'assigned').length;
    
    // Update task with new patient count
    const updatedTask: Task = {
      ...task,
      patientCount: assignedPatientsCount
    };
    
    // Navigate back to DoctorTaskManagement with the updated task
    navigation.navigate('DoctorTaskManagement', {
      updatedTask: updatedTask
    });
  };

  const handleAssignTask = async () => {
    if (!title || !frequency || !hour || !selectedProof.length) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');
      const now = new Date().toISOString();

      for (const patient of patients) {
        // Check for existing task for this doctor/patient/title/frequency
        const { data: existingTasks, error: fetchError } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_by', user.id)
          .eq('assigned_to', patient.id)
          .eq('title', title)
          .eq('frequency', frequency)
          .order('created_at', { ascending: false });
        if (fetchError) throw fetchError;
        const pendingTask = existingTasks?.find(t => t.status === 'pending');
        const suspendedTask = existingTasks?.find(t => t.status === 'suspended');

        if (patient.status === 'assigned') {
          if (suspendedTask) {
            // Reactivate suspended task
            await supabase
              .from('tasks')
              .update({ status: 'pending' })
              .eq('id', suspendedTask.id);
          } else if (!pendingTask) {
            // Create new task if not already pending
            await supabase
        .from('tasks')
        .insert({
          title,
          description,
          frequency,
          due_hour: `${hour}:${minute} ${ampm}`,
          proof_type: selectedProof.join(','),
          assigned_by: user.id,
                assigned_to: patient.id,
                status: 'pending',
                created_at: now,
        });
          }
        } else if (patient.status === 'suspended') {
          if (pendingTask) {
            // Suspend the pending task
            await supabase
              .from('tasks')
              .update({ status: 'suspended' })
              .eq('id', pendingTask.id);
          }
        }
      }

      await fetchPatients(); // Refresh patient list
      Alert.alert(
        'Success',
        'Assignments updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating assignments:', error);
      Alert.alert('Error', 'Failed to update assignments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = searchQuery
    ? patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E86D6D" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Task</Text>
        <TouchableOpacity style={styles.createNewButton}>
          <Text style={styles.createNewText}>Create New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Task</Text>
          <View style={styles.taskCard}>
            <View style={styles.taskIcon}>
              <Ionicons name={task?.icon || 'medical'} size={24} color="#4A6FFF" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task?.title || 'Daily Medication'}</Text>
              <Text style={styles.taskDescription}>{task?.description || 'Take prescribed medication'}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={24} color="#4A6FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          
          <Text style={styles.subsectionTitle}>Frequency</Text>
          <View style={styles.frequencyOptions}>
            <TouchableOpacity 
              style={[styles.frequencyOption, frequency === 'Daily' && styles.selectedFrequency]}
              onPress={() => handleFrequencySelect('Daily')}
            >
              <Text style={[styles.frequencyTitle, frequency === 'Daily' && styles.selectedText]}>Daily</Text>
              <Text style={[styles.frequencySubtitle, frequency === 'Daily' && styles.selectedText]}>Every day</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.frequencyOption, frequency === 'Weekly' && styles.selectedFrequency]}
              onPress={() => handleFrequencySelect('Weekly')}
            >
              <Text style={[styles.frequencyTitle, frequency === 'Weekly' && styles.selectedText]}>Weekly</Text>
              <Text style={[styles.frequencySubtitle, frequency === 'Weekly' && styles.selectedText]}>Specific days</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.frequencyOption, frequency === 'Monthly' && styles.selectedFrequency]}
              onPress={() => handleFrequencySelect('Monthly')}
            >
              <Text style={[styles.frequencyTitle, frequency === 'Monthly' && styles.selectedText]}>Monthly</Text>
              <Text style={[styles.frequencySubtitle, frequency === 'Monthly' && styles.selectedText]}>Set pattern</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subsectionTitle}>Due Hour</Text>
          <View style={styles.timeInputContainer}>
            <TextInput
              style={styles.timeInput}
              value={hour}
              onChangeText={setHour}
              keyboardType="number-pad"
              maxLength={2}
            />
            <Text style={styles.timeColon}>:</Text>
            <TextInput
              style={styles.timeInput}
              value={minute}
              onChangeText={setMinute}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TouchableOpacity 
              style={styles.ampmButton}
              onPress={() => setAmPm(ampm === 'AM' ? 'PM' : 'AM')}
            >
              <Text style={styles.ampmText}>{ampm}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subsectionTitle}>Proof Required</Text>
          <View style={styles.proofOptions}>
            <TouchableOpacity 
              style={[styles.proofOption, selectedProof.includes('photo') && styles.selectedProof]}
              onPress={() => handleProofSelect('photo')}
            >
              <Ionicons name="camera-outline" size={24} color={selectedProof.includes('photo') ? '#4A6FFF' : '#666'} />
              <Text style={[styles.proofText, selectedProof.includes('photo') && styles.selectedProofText]}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.proofOption, selectedProof.includes('measurement') && styles.selectedProof]}
              onPress={() => handleProofSelect('measurement')}
            >
              <Ionicons name="calculator-outline" size={24} color={selectedProof.includes('measurement') ? '#4A6FFF' : '#666'} />
              <Text style={[styles.proofText, selectedProof.includes('measurement') && styles.selectedProofText]}>Measurement</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.proofOption, selectedProof.includes('confirmation') && styles.selectedProof]}
              onPress={() => handleProofSelect('confirmation')}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color={selectedProof.includes('confirmation') ? '#4A6FFF' : '#666'} />
              <Text style={[styles.proofText, selectedProof.includes('confirmation') && styles.selectedProofText]}>Confirmation</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.patientSection}>
          <View style={styles.patientTabs}>
            <TouchableOpacity style={[styles.patientTab, styles.activePatientTab]}>
              <Text style={[styles.patientTabText, styles.activePatientTabText]}>Active (12)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.patientTab}>
              <Text style={styles.patientTabText}>Invited (3)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.patientTab}>
              <Text style={styles.patientTabText}>Archived (5)</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.patientActions}>
            <TouchableOpacity style={styles.selectAllButton}>
              <Ionicons name="checkbox-outline" size={20} color="#4A6FFF" />
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.assignGroupButton}>
              <Ionicons name="people-outline" size={20} color="#4A6FFF" />
              <Text style={styles.assignGroupText}>Assign to Group</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.patientList}>
            {filteredPatients.map(patient => (
              <View key={patient.id} style={styles.patientItem}>
                <View style={styles.patientInfo}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person-circle" size={40} color="#4A6FFF" />
                  </View>
                  <View>
                    <Text style={styles.patientName}>{patient.full_name}</Text>
                    <Text style={styles.patientId}>ID: {patient.id}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    patient.status === 'suspended' && styles.assignButton
                  ]}
                  onPress={() => {
                    setSelectedPatient(patient.id);
                    handlePatientAction(patient);
                  }}
                >
                  <Text style={[
                    styles.actionButtonText,
                    patient.status === 'suspended' && styles.assignButtonText
                  ]}>
                    {patient.status === 'assigned' ? 'Suspend' : 'Assign'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {notification && (
        <View style={styles.notificationContainer}>
          <View style={styles.notification}>
            <Text style={styles.notificationText}>
              Task {notification.type} for {notification.patientName}
            </Text>
            {notification.type === 'suspended' && (
              <TouchableOpacity 
                style={styles.undoButton}
                onPress={() => {
                  const patient = patients.find(p => p.name === notification.patientName);
                  if (patient) handlePatientAction(patient);
                }}
              >
                <Text style={styles.undoButtonText}>UNDO</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submittingButton]}
          onPress={handleAssignTask}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Assigning...' : 'Assign Task'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  createNewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createNewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    padding: 16,
    borderRadius: 12,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6EBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666666',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 12,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedFrequency: {
    backgroundColor: '#4A6FFF',
  },
  frequencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  frequencySubtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  selectedText: {
    color: 'white',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    backgroundColor: '#F5F7FF',
    width: 60,
    height: 40,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  timeColon: {
    fontSize: 20,
    fontWeight: '600',
  },
  ampmButton: {
    backgroundColor: '#F5F7FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ampmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  proofOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  proofOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F7FF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedProof: {
    backgroundColor: '#E6EBFF',
    borderColor: '#4A6FFF',
    borderWidth: 1,
  },
  proofText: {
    fontSize: 14,
    color: '#666666',
  },
  selectedProofText: {
    color: '#4A6FFF',
  },
  patientSection: {
    padding: 16,
  },
  patientTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  patientTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activePatientTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A6FFF',
  },
  patientTabText: {
    fontSize: 14,
    color: '#666666',
  },
  activePatientTabText: {
    color: '#4A6FFF',
    fontWeight: '600',
  },
  patientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    color: '#4A6FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  assignGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignGroupText: {
    color: '#4A6FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    marginLeft: 8,
    fontSize: 14,
  },
  patientList: {
    gap: 12,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6EBFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  patientId: {
    fontSize: 12,
    color: '#666666',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F7FF',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FF4B55',
  },
  assignButton: {
    backgroundColor: '#E6EBFF',
  },
  assignButtonText: {
    color: '#4A6FFF',
  },
  notificationContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    maxWidth: '90%',
  },
  notificationText: {
    color: 'white',
    fontSize: 14,
    marginRight: 12,
  },
  undoButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  undoButtonText: {
    color: '#4A6FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: '#E86D6D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 25,
    gap: 8,
  },
  submittingButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DoctorAssignTask; 