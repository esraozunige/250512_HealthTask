import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorCreateTask'>;

type Patient = {
  id: string;
  full_name: string;
};

const DoctorCreateTask = () => {
  const navigation = useNavigation<NavigationProp>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  React.useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('doctor_id', user.id)
        .eq('role', 'patient');

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch patients');
    }
  };

  const handleCreateTask = async () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    if (!frequency.trim()) {
      Alert.alert('Error', 'Please enter a frequency');
      return;
    }

    setLoading(true);

    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('tasks')
        .insert({
          title: title.trim(),
          description: description.trim(),
          frequency: frequency.trim(),
          assigned_to: selectedPatient.id,
          assigned_by: user.id,
          due_date: dueDate.toISOString(),
          status: 'pending',
        });

      if (error) throw error;

      Alert.alert('Success', 'Task created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Patient</Text>
          <View style={styles.patientSelector}>
            {patients.map(patient => (
              <TouchableOpacity
                key={patient.id}
                style={[
                  styles.patientOption,
                  selectedPatient?.id === patient.id && styles.selectedPatient,
                ]}
                onPress={() => setSelectedPatient(patient)}
              >
                <Text
                  style={[
                    styles.patientName,
                    selectedPatient?.id === patient.id && styles.selectedPatientText,
                  ]}
                >
                  {patient.full_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Frequency</Text>
          <TextInput
            style={styles.input}
            value={frequency}
            onChangeText={setFrequency}
            placeholder="e.g., Daily, Weekly, Monthly"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {dueDate.toLocaleDateString()}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateTask}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create Task</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#eee',
  },
  textArea: {
    height: 100,
  },
  patientSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  patientOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedPatient: {
    backgroundColor: '#E86D6D',
    borderColor: '#E86D6D',
  },
  patientName: {
    fontSize: 14,
    color: '#666',
  },
  selectedPatientText: {
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  createButton: {
    backgroundColor: '#E86D6D',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  disabledButton: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoctorCreateTask; 