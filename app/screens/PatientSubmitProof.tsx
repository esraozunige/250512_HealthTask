import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import * as ImagePicker from 'expo-image-picker';
import PatientBottomNav from '../components/PatientBottomNav';
import { supabase } from '../../lib/supabase';
import { decode } from 'base64-arraybuffer';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientSubmitProof'>;
type PatientSubmitProofRouteProp = RouteProp<RootStackParamList, 'PatientSubmitProof'>;

const PatientSubmitProof = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PatientSubmitProofRouteProp>();
  const { task } = route.params;

  const [feeling, setFeeling] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };

  const uploadImageToStorage = async (base64Image: string) => {
    try {
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      const filePath = `task-proofs/${user.id}/${task.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, decode(base64Image), {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('proofs')
        .getPublicUrl(filePath);

      if (data?.publicURL) {
        return data.publicURL;
      }

      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmitProof = async () => {
    try {
      setIsSubmitting(true);
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      let proofImageUrl = null;
      if (proofImage) {
        const response = await fetch(proofImage);
        const blob = await response.blob();
        const reader = new FileReader();
        const base64Image = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        proofImageUrl = await uploadImageToStorage(base64Image.split(',')[1]);
      }

      const { error: submissionError } = await supabase
        .from('task_submissions')
        .insert({
          task_id: task.id,
          user_id: user.id,
          proof_text: feeling,
          proof_image_url: proofImageUrl,
          feeling: feeling,
          side_effects: sideEffects,
          status: 'pending'
        });

      if (submissionError) throw submissionError;

      Alert.alert(
        'Success',
        'Your task proof has been submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.navigate('PatientDashboard') }]
      );
    } catch (error) {
      console.error('Error submitting proof:', error);
      Alert.alert('Error', 'Failed to submit proof. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Ionicons name="heart" size={24} color="#E86D6D" />
            </View>
            <View style={styles.taskMeta}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.taskTiming}>
                <Text style={styles.dueText}>Due today</Text>
                <Text style={styles.frequencyText}>{task.frequency}</Text>
                <Text style={styles.timeText}>8:00 AM</Text>
              </View>
            </View>
          </View>

          <View style={styles.streakBox}>
            <Ionicons name="trophy" size={20} color="#E86D6D" />
            <Text style={styles.streakText}>
              Your Health Journey
            </Text>
            <Text style={styles.streakDescription}>
              You've completed this task 24 days in a row! Keep up the great work to maintain your streak.
            </Text>
          </View>

          <Text style={styles.instruction}>
            Complete your task and submit proof to track your progress.
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>How are you feeling today?</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe how you're feeling after your daily walk"
              value={feeling}
              onChangeText={setFeeling}
              multiline
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Any side effects? (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe any side effects you may be experiencing..."
              value={sideEffects}
              onChangeText={setSideEffects}
              multiline
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Upload Photo/Video (optional)</Text>
            <TouchableOpacity 
              style={styles.uploadBox}
              onPress={handleUploadImage}
            >
              {proofImage ? (
                <Image source={{ uri: proofImage }} style={styles.uploadedImage} />
              ) : (
                <>
                  <Ionicons name="image" size={24} color="#666" />
                  <Text style={styles.uploadText}>
                    Tap to upload a photo or video as proof
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmitProof}
          disabled={isSubmitting}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>Submit Proof</Text>
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
  taskTiming: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dueText: {
    color: '#E86D6D',
    fontSize: 14,
    fontWeight: '500',
  },
  frequencyText: {
    color: '#666',
    fontSize: 14,
  },
  timeText: {
    color: '#666',
    fontSize: 14,
  },
  streakBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  streakDescription: {
    fontSize: 14,
    color: '#E86D6D',
    lineHeight: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
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
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PatientSubmitProof; 