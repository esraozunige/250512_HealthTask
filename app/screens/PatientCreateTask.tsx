import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTaskContext } from '../context/TaskContext';
import PatientBottomNav from '../components/PatientBottomNav';

// Types for icon, frequency, proof
const iconOptions = [
  { key: 'stats', icon: 'stats-chart' },
  { key: 'heart', icon: 'heart' },
  { key: 'cart', icon: 'cart' },
  { key: 'calendar', icon: 'calendar' },
  { key: 'bulb', icon: 'bulb' },
  { key: 'add', icon: 'add' },
];
const frequencyOptions = [
  { key: 'Daily', label: 'Daily', sub: 'Every day' },
  { key: 'Weekly', label: 'Weekly', sub: 'Specific days' },
  { key: 'Custom', label: 'Custom', sub: 'Set pattern' },
];
const proofTypes = ['Photo', 'Number/Value'];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientCreateTask'>;
type PatientCreateTaskRouteProp = RouteProp<RootStackParamList, 'PatientCreateTask'>;

type TaskIcon = 'stats' | 'heart' | 'cart' | 'calendar' | 'bulb' | 'add';
type Frequency = 'Daily' | 'Weekly' | 'Custom';
type ProofType = 'Photo' | 'Number/Value';

const PatientCreateTask = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PatientCreateTaskRouteProp>();
  const { addTask, updateTask } = useTaskContext();
  const editingTask = route.params?.task;

  const [taskName, setTaskName] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [selectedIcon, setSelectedIcon] = useState<TaskIcon>(editingTask?.icon as TaskIcon || 'stats');
  const [frequency, setFrequency] = useState<Frequency>(editingTask?.frequency as Frequency || 'Daily');
  const [hour, setHour] = useState(typeof editingTask?.hour === 'string' ? editingTask.hour : '09');
  const [minute, setMinute] = useState(typeof editingTask?.minute === 'string' ? editingTask.minute : '00');
  const [amPm, setAmPm] = useState<'AM' | 'PM'>(editingTask?.amPm === 'AM' || editingTask?.amPm === 'PM' ? editingTask.amPm : 'AM');
  const [proofRequired, setProofRequired] = useState<ProofType[]>(Array.isArray(editingTask?.proofRequired) ? editingTask.proofRequired as ProofType[] : []);

  const handleSave = () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }
    // Save task
    const task = {
      id: editingTask?.id || `task-${Date.now()}`,
      title: taskName,
      description,
      icon: selectedIcon,
      frequency,
      hour,
      minute,
      amPm,
      assignedBy: 'Self-assigned',
      dueIn: '1 day',
      risk: 1,
      status: (editingTask?.status === 'completed' ? 'completed' : 'pending') as 'completed' | 'pending',
      proofRequired,
    };
    if (editingTask) {
      updateTask(editingTask.id, task);
    } else {
      addTask(task);
    }
    navigation.goBack();
  };

  const renderIcon = (icon: typeof iconOptions[0]) => (
    <TouchableOpacity
      key={icon.key}
      style={[styles.iconButton, selectedIcon === icon.key && styles.selectedIcon]}
      onPress={() => setSelectedIcon(icon.key as TaskIcon)}
    >
      <Ionicons
        name={icon.icon as any}
        size={24}
        color={selectedIcon === icon.key ? '#E86D6D' : '#666'}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>{editingTask ? 'Edit Task' : 'Create New Task'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Daily Walk, Blood Pressure Check"
            value={taskName}
            onChangeText={setTaskName}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your task..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
          <Text style={styles.label}>Task Icon</Text>
          <View style={styles.iconGrid}>{iconOptions.map(renderIcon)}</View>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyOptions}>
            {frequencyOptions.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.frequencyButton, frequency === opt.key && styles.selectedFrequency]}
                onPress={() => setFrequency(opt.key as Frequency)}
              >
                <Text style={[styles.frequencyText, frequency === opt.key && styles.selectedFrequencyText]}>{opt.label}</Text>
                <Text style={styles.frequencySubtext}>{opt.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Due Hour</Text>
          <View style={styles.timeContainer}>
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
            <TouchableOpacity style={styles.amPmButton} onPress={() => setAmPm(amPm === 'AM' ? 'PM' : 'AM')}>
              <Text style={styles.amPmText}>{amPm}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Proof Required</Text>
          <View style={styles.proofOptions}>
            {proofTypes.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.proofButton, proofRequired.includes(type as ProofType) && styles.selectedProof]}
                onPress={() => {
                  if (proofRequired.includes(type as ProofType)) {
                    setProofRequired(proofRequired.filter(p => p !== type));
                  } else {
                    setProofRequired([...proofRequired, type as ProofType]);
                  }
                }}
              >
                <Ionicons
                  name={type === 'Photo' ? 'camera' : 'analytics'}
                  size={24}
                  color={proofRequired.includes(type as ProofType) ? '#E86D6D' : '#666'}
                />
                <Text style={styles.proofText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>
      </View>
      <PatientBottomNav activeTab="Tasks" />
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
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#E86D6D',
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedFrequency: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#E86D6D',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  selectedFrequencyText: {
    color: '#E86D6D',
  },
  frequencySubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 60,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  timeColon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  amPmButton: {
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    padding: 12,
    width: 60,
    alignItems: 'center',
  },
  amPmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  proofOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  proofButton: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedProof: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#E86D6D',
  },
  proofText: {
    fontSize: 16,
    color: '#666',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#E86D6D',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PatientCreateTask; 