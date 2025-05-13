import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerDashboard'>;
// In the future, use route params for the task

const mockTask = {
  title: '30-Min Cardio Workout',
  desc: 'Complete 30-minute cardio session',
  status: 'Due in 2 days',
  frequency: '3x Weekly',
  supporter: "Support Deen's Health Journey",
  supporterDesc: "By completing your own tasks, you're helping create a supportive environment for Deen's health goals. Your participation matters!",
};

const PlayerSubmitProof = () => {
  const navigation = useNavigation<NavigationProp>();
  const [feeling, setFeeling] = useState('');
  const [details, setDetails] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setProofImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    // In a real app, upload proof and update task status here
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      navigation.navigate('PlayerDashboard');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <MaterialCommunityIcons name="heart" size={24} color="#B39DFF" style={{ marginRight: 8 }} />
            <Text style={styles.taskTitle}>{mockTask.title}</Text>
          </View>
          <View style={styles.taskMetaRow}>
            <View style={styles.statusBadge}><Text style={styles.statusBadgeText}>{mockTask.status}</Text></View>
            <Text style={styles.frequency}>{mockTask.frequency}</Text>
          </View>
          <Text style={styles.taskDesc}>{mockTask.desc}</Text>
          <View style={styles.supportBox}>
            <Ionicons name="flash-outline" size={20} color="#B39DFF" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>{mockTask.supporter}</Text>
              <Text style={styles.supportDesc}>{mockTask.supporterDesc}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.label}>Complete your task and submit proof to show your participation.</Text>
        <Text style={styles.label}>How are you feeling today?</Text>
        <TextInput
          style={styles.input}
          placeholder="Share how you're feeling after your workout..."
          value={feeling}
          onChangeText={setFeeling}
          multiline
        />
        <Text style={styles.label}>Upload Photo/Video</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
          {proofImage ? (
            <Image source={{ uri: proofImage }} style={styles.uploadedImage} />
          ) : (
            <>
              <Ionicons name="image-outline" size={36} color="#B39DFF" />
              <Text style={styles.uploadText}>Tap to upload a photo or video as proof</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.label}>Additional details (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Share any additional details about your workout..."
          value={details}
          onChangeText={setDetails}
          multiline
        />
        <TouchableOpacity
          style={[styles.submitButton, uploading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          <Ionicons name="cloud-upload-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitButtonText}>{uploading ? 'Submitting...' : 'Submit Proof'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerDashboard')}>
          <Ionicons name="home" size={24} color="#6B5ECD" />
          <Text style={[styles.navLabel, { color: '#6B5ECD' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerTaskHistory')}>
          <Ionicons name="checkbox-outline" size={24} color="#888" />
          <Text style={styles.navLabel}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerGroup')}>
          <Ionicons name="people-outline" size={24} color="#888" />
          <Text style={styles.navLabel}>Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerProfile')}>
          <Ionicons name="person-outline" size={24} color="#888" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B5ECD',
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerIcon: { padding: 4 },
  headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 8 },
  content: { flex: 1, padding: 18 },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  taskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  taskTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', flex: 1 },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusBadge: {
    backgroundColor: '#FDE8E8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginRight: 8,
  },
  statusBadgeText: { color: '#E86D6D', fontWeight: '600', fontSize: 13 },
  frequency: { color: '#888', fontSize: 14 },
  taskDesc: { fontSize: 15, color: '#444', marginBottom: 8 },
  supportBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  supportTitle: { fontWeight: 'bold', fontSize: 15, color: '#6B5ECD', marginBottom: 2 },
  supportDesc: { fontSize: 13, color: '#666' },
  label: { fontSize: 15, color: '#222', fontWeight: '500', marginTop: 8, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8FF',
    marginBottom: 8,
    minHeight: 48,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 12,
    backgroundColor: '#fff',
    minHeight: 100,
  },
  uploadText: { color: '#888', fontSize: 15, marginTop: 8, textAlign: 'center' },
  uploadedImage: { width: 120, height: 120, borderRadius: 10, marginBottom: 8 },
  submitButton: {
    backgroundColor: '#6B5ECD',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingVertical: 10,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navLabel: { fontSize: 13, color: '#888', marginTop: 2, fontWeight: '500' },
});

export default PlayerSubmitProof; 