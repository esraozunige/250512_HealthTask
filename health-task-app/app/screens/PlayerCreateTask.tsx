import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';

const ICONS = [
  { name: 'trending-up', lib: Ionicons },
  { name: 'heart-outline', lib: Ionicons },
  { name: 'cart-outline', lib: Ionicons },
  { name: 'calendar-outline', lib: Ionicons },
  { name: 'lightbulb-outline', lib: Ionicons },
  { name: 'add-circle-outline', lib: Ionicons },
];

const FREQUENCIES = [
  { key: 'daily', label: 'Daily', sub: 'Every day' },
  { key: 'weekly', label: 'Weekly', sub: 'Specific days' },
  { key: 'custom', label: 'Custom', sub: 'Set pattern' },
];

const PROOFS = [
  { key: 'photo', label: 'Photo', icon: <Ionicons name="camera-outline" size={20} color="#222" /> },
  { key: 'number', label: 'Number/Value', icon: <MaterialCommunityIcons name="numeric" size={20} color="#222" /> },
];

const PlayerCreateTask = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PlayerCreateTask'>>();
  const route = useRoute<any>();
  const { group_id } = route.params;
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [iconIdx, setIconIdx] = useState(0);
  const [frequency, setFrequency] = useState('daily');
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [amPm, setAmPm] = useState('AM');
  const [proofs, setProofs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleProofToggle = (key: string) => {
    setProofs(proofs.includes(key) ? proofs.filter(p => p !== key) : [...proofs, key]);
  };

  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    if (proofs.length === 0) {
      Alert.alert('Error', 'Please select at least one proof type');
      return;
    }

    setIsLoading(true);
    try {
      const user = supabase.auth.user();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Convert time to 24-hour format
      const hour24 = amPm === 'PM' ? (parseInt(hour) % 12) + 12 : parseInt(hour) % 12;
      const timeString = `${hour24.toString().padStart(2, '0')}:${minute}:00`;

      // Insert task into database
      const { data, error } = await supabase.from('tasks').insert([
        {
          group_id,
          assigned_by: user.id,
          assigned_to: user.id,
          title: taskName.trim(),
          description: description.trim(),
          frequency,
          due_hour: timeString,
          proof_type: proofs.join(','),
          is_active: true,
          start_date: new Date().toISOString().split('T')[0],
        },
      ]);

      if (error) throw error;

      Alert.alert('Success', 'Task created successfully');
      navigation.navigate('PlayerDashboard');
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#6B5ECD" />
          </TouchableOpacity>
          <Text style={styles.header}>Create Health Task</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Daily Walk, Blood Pressure Check"
              value={taskName}
              onChangeText={setTaskName}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              placeholder="Provide clear instructions for yourself..."
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Task Icon</Text>
            <View style={styles.iconRow}>
              {ICONS.map((icon, idx) => {
                const IconLib = icon.lib;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.iconButton, idx === iconIdx && styles.iconButtonSelected]}
                    onPress={() => setIconIdx(idx)}
                  >
                    <IconLib name={icon.name as any} size={26} color={idx === iconIdx ? '#6B5ECD' : '#888'} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.freqRow}>
              {FREQUENCIES.map(f => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.freqButton, frequency === f.key && styles.freqButtonSelected]}
                  onPress={() => setFrequency(f.key)}
                >
                  <Text style={[styles.freqLabel, frequency === f.key && styles.freqLabelSelected]}>{f.label}</Text>
                  <Text style={[styles.freqSub, frequency === f.key && styles.freqLabelSelected]}>{f.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Hour</Text>
            <View style={styles.timeRow}>
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
                style={[styles.ampmButton, amPm === 'AM' && styles.ampmSelected]}
                onPress={() => setAmPm('AM')}
              >
                <Text style={[styles.ampmText, amPm === 'AM' && styles.ampmTextSelected]}>AM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ampmButton, amPm === 'PM' && styles.ampmSelected]}
                onPress={() => setAmPm('PM')}
              >
                <Text style={[styles.ampmText, amPm === 'PM' && styles.ampmTextSelected]}>PM</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Proof Required</Text>
            <View style={styles.proofRow}>
              {PROOFS.map(p => (
                <TouchableOpacity
                  key={p.key}
                  style={[styles.proofButton, proofs.includes(p.key) && styles.proofButtonSelected]}
                  onPress={() => handleProofToggle(p.key)}
                >
                  {p.icon}
                  <Text style={[styles.proofLabel, proofs.includes(p.key) && styles.proofLabelSelected]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateTask}>
          <Text style={styles.createButtonText}>Create Task</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F6FA',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6B5ECD',
    marginBottom: 18,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8FF',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  iconButton: {
    backgroundColor: '#F3F0FF',
    borderRadius: 10,
    padding: 10,
  },
  iconButtonSelected: {
    backgroundColor: '#E5DEFF',
    borderWidth: 2,
    borderColor: '#6B5ECD',
  },
  freqRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  freqButton: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  freqButtonSelected: {
    backgroundColor: '#E5DEFF',
    borderColor: '#6B5ECD',
  },
  freqLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
  },
  freqLabelSelected: {
    color: '#6B5ECD',
  },
  freqSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  timeInput: {
    width: 48,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    backgroundColor: '#F8F8FF',
    textAlign: 'center',
  },
  timeColon: {
    fontSize: 18,
    color: '#888',
    marginHorizontal: 2,
  },
  ampmButton: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F8FF',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  ampmSelected: {
    backgroundColor: '#E5DEFF',
    borderColor: '#6B5ECD',
  },
  ampmText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
  },
  ampmTextSelected: {
    color: '#6B5ECD',
  },
  proofRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  proofButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    gap: 8,
    justifyContent: 'center',
  },
  proofButtonSelected: {
    backgroundColor: '#E5DEFF',
    borderColor: '#6B5ECD',
  },
  proofLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
  },
  proofLabelSelected: {
    color: '#6B5ECD',
  },
  footer: {
    backgroundColor: 'transparent',
    padding: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  createButton: {
    backgroundColor: '#6B5ECD',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  createButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default PlayerCreateTask; 