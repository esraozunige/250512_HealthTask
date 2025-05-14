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
  Button,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';

const ICONS = [
  { key: 'stats', icon: 'stats-chart' },
  { key: 'heart', icon: 'heart' },
  { key: 'cart', icon: 'cart' },
  { key: 'calendar', icon: 'calendar' },
  { key: 'bulb', icon: 'bulb' },
  { key: 'add', icon: 'add' },
];
const FREQUENCIES = [
  { key: 'Daily', label: 'Daily', sub: 'Every day' },
  { key: 'Weekly', label: 'Weekly', sub: 'Specific days' },
  { key: 'Monthly', label: 'Monthly', sub: 'Set pattern' },
  { key: 'One-off', label: 'One-off', sub: 'Single occurrence' },
];
const PROOFS = [
  { key: 'photo', label: 'Photo', icon: <Ionicons name="camera-outline" size={20} color="#222" /> },
  { key: 'number', label: 'Number/Value', icon: <Ionicons name="analytics-outline" size={20} color="#222" /> },
  { key: 'confirmation', label: 'Confirmation', icon: <Ionicons name="checkmark-circle-outline" size={20} color="#222" /> },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorCreateTask'>;

type Patient = {
  id: string;
  full_name: string;
};

const DoctorCreateTask = () => {
  const navigation = useNavigation<NavigationProp>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('stats');
  const [frequency, setFrequency] = useState('Daily');
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmPm] = useState<'AM' | 'PM'>('AM');
  const [selectedProof, setSelectedProof] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }
    if (!frequency.trim()) {
      Alert.alert('Error', 'Please select a frequency');
      return;
    }
    if (!hour || !minute) {
      Alert.alert('Error', 'Please enter a due hour');
      return;
    }
    setLoading(true);
    try {
      const user = await supabase.auth.user();
      if (!user) {
        Alert.alert('Error', 'You are not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('task_templates').insert([
        {
          doctor_id: user.id,
          title: title.trim(),
          description: description.trim(),
          icon: selectedIcon,
          frequency: frequency.trim(),
          due_hour: `${hour}:${minute} ${ampm}`,
          proof_type: selectedProof.join(','),
          created_at: now,
        }
      ]).select();
      if (error) {
        Alert.alert('Error', 'Failed to create task template: ' + error.message);
        setLoading(false);
        return;
      }
      const template = Array.isArray(data) ? data[0] : data;
      navigation.navigate('DoctorTaskManagement', { updatedTask: template });
    } catch (err) {
      Alert.alert('Error', 'Unexpected error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (icon: typeof ICONS[0]) => (
    <TouchableOpacity
      key={icon.key}
      style={[styles.iconButton, selectedIcon === icon.key && styles.selectedIcon]}
      onPress={() => setSelectedIcon(icon.key)}
    >
      <Ionicons
        name={icon.icon as any}
        size={24}
        color={selectedIcon === icon.key ? '#4A6FFF' : '#666'}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Healthy Task</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.form}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Daily Walk, Blood Pressure Check"
            value={title}
            onChangeText={setTitle}
          />
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide clear instructions for the patient..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.label}>Task Icon</Text>
          <View style={styles.iconGrid}>{ICONS.map(renderIcon)}</View>
          <Text style={styles.label}>Frequency</Text>
          <View style={styles.frequencyOptions}>
            {FREQUENCIES.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.frequencyButton, frequency === opt.key && styles.selectedFrequency]}
                onPress={() => setFrequency(opt.key)}
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
            <TouchableOpacity style={styles.amPmButton} onPress={() => setAmPm(ampm === 'AM' ? 'PM' : 'AM')}>
              <Text style={styles.amPmText}>{ampm}</Text>
            </TouchableOpacity>
        </View>
          <Text style={styles.label}>Proof Required</Text>
          <View style={styles.proofOptions}>
            {PROOFS.map(type => (
          <TouchableOpacity
                key={type.key}
                style={[styles.proofButton, selectedProof.includes(type.key) && styles.selectedProof]}
                onPress={() => {
                  if (selectedProof.includes(type.key)) {
                    setSelectedProof(selectedProof.filter(p => p !== type.key));
                  } else {
                    setSelectedProof([...selectedProof, type.key]);
                  }
                }}
          >
                {type.icon}
                <Text style={styles.proofText}>{type.label}</Text>
          </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateTask} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>
      <Button title="Test" onPress={() => Alert.alert('Test', 'Button works!')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    backgroundColor: '#4A6FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
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
    height: 100,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
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
    backgroundColor: '#E6EBFF',
    borderWidth: 1,
    borderColor: '#4A6FFF',
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: '#F5F7FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedFrequency: {
    backgroundColor: '#E6EBFF',
    borderWidth: 1,
    borderColor: '#4A6FFF',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  selectedFrequencyText: {
    color: '#4A6FFF',
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
    marginBottom: 8,
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
    marginBottom: 8,
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
    backgroundColor: '#E6EBFF',
    borderWidth: 1,
    borderColor: '#4A6FFF',
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
  createButton: {
    backgroundColor: '#4A6FFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoctorCreateTask; 