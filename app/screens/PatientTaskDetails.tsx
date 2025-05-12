import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import PatientBottomNav from '../components/PatientBottomNav';
import * as ImagePicker from 'expo-image-picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientTaskDetails'>;
type PatientTaskDetailsRouteProp = RouteProp<RootStackParamList, 'PatientTaskDetails'>;

type Task = {
  id: string;
  title: string;
  description: string;
  frequency: string;
  due_hour: string;
  proof_type: string;
  last_submission: {
    id: string;
    status: string;
    created_at: string;
    proof_text: string;
    proof_image_url: string;
    feeling: string;
    side_effects: string;
  } | null;
};

const PatientTaskDetails = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PatientTaskDetailsRouteProp>();
  const { taskId } = route.params;

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [feeling, setFeeling] = useState('');
  const [sideEffects, setSideEffects] = useState('');

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          last_submission:task_submissions (
            id,
            status,
            created_at,
            proof_text,
            proof_image_url,
            feeling,
            side_effects
          )
        `)
        .eq('id', taskId)
        .single();

      if (error) throw error;

      setTask(data);
      if (data.last_submission) {
        setProofText(data.last_submission.proof_text || '');
        setProofImage(data.last_submission.proof_image_url);
        setFeeling(data.last_submission.feeling || '');
        setSideEffects(data.last_submission.side_effects || '');
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      Alert.alert('Error', 'Failed to fetch task details');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!task) return;

    if (task.proof_type === 'text' && !proofText) {
      Alert.alert('Error', 'Please provide proof text');
      return;
    }

    if (task.proof_type === 'image' && !proofImage) {
      Alert.alert('Error', 'Please provide proof image');
      return;
    }

    if (task.proof_type === 'both' && (!proofText || !proofImage)) {
      Alert.alert('Error', 'Please provide both text and image proof');
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      let proofImageUrl = null;
      if (proofImage) {
        const response = await fetch(proofImage);
        const blob = await response.blob();
        const fileName = `${taskId}_${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-proofs')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('task-proofs')
          .getPublicUrl(fileName);

        if (data?.publicURL) {
          proofImageUrl = data.publicURL;
        }
      }

      const { error } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          proof_text: proofText,
          proof_image_url: proofImageUrl,
          feeling,
          side_effects: sideEffects,
          status: 'pending',
        });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Task submission sent successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting task:', error);
      Alert.alert('Error', 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E86D6D" />
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text>Task not found</Text>
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
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text style={styles.headerTitle}>Task Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.taskInfo}>
          <View style={styles.taskHeader}>
            <View style={styles.taskIcon}>
              <Ionicons name="calendar" size={24} color="#E86D6D" />
            </View>
            <View style={styles.taskMeta}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskFrequency}>
                {task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)} at {task.due_hour}
              </Text>
            </View>
          </View>

          {task.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description:</Text>
              <Text style={styles.descriptionText}>{task.description}</Text>
            </View>
          )}

          <View style={styles.proofSection}>
            <Text style={styles.sectionTitle}>Submit Proof</Text>

            {(task.proof_type === 'text' || task.proof_type === 'both') && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Proof Text *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={proofText}
                  onChangeText={setProofText}
                  placeholder="Enter your proof text"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}

            {(task.proof_type === 'image' || task.proof_type === 'both') && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Proof Image *</Text>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={pickImage}
                >
                  {proofImage ? (
                    <Image
                      source={{ uri: proofImage }}
                      style={styles.selectedImage}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="camera" size={32} color="#999" />
                      <Text style={styles.imagePlaceholderText}>
                        Tap to select image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>How are you feeling?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={feeling}
                onChangeText={setFeeling}
                placeholder="Describe how you're feeling"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Any side effects?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={sideEffects}
                onChangeText={setSideEffects}
                placeholder="Describe any side effects you're experiencing"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Proof</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <PatientBottomNav activeTab="Tasks" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
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
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  taskFrequency: {
    fontSize: 14,
    color: '#666',
  },
  descriptionContainer: {
    marginBottom: 24,
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
  proofSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: '#E86D6D',
    borderRadius: 25,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PatientTaskDetails; 