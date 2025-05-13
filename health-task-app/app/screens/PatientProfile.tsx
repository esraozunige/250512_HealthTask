import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import PatientBottomNav from '../components/PatientBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientProfile'>;

// Mock data - In a real app, this would come from your backend
const mockUserData = {
  fullName: 'Deen Rufus',
  email: 'deen.rufus@example.com',
  phone: '+41 (75) 123 4567',
  memberSince: 'March 25, 2025',
  healthStats: {
    currentStreak: 12,
    longestStreak: 15,
    tasksCompleted: 87,
  },
};

const PatientProfile = () => {
  const navigation = useNavigation<NavigationProp>();

  const renderInfoItem = (label: string, value: string) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderStatItem = (label: string, value: string | number) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate({ name: 'PatientEditProfile', params: undefined })}
        >
          <Ionicons name="pencil" size={20} color="#E86D6D" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Ionicons name="person-circle-outline" size={120} color="#ccc" />
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera" size={20} color="#E86D6D" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{mockUserData.fullName}</Text>
          <Text style={styles.userEmail}>{mockUserData.email}</Text>

          <View style={styles.streakContainer}>
            <Ionicons name="moon" size={16} color="#666" />
            <Text style={styles.streakText}>{mockUserData.healthStats.currentStreak} day streak</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          {renderInfoItem('Full Name', mockUserData.fullName)}
          {renderInfoItem('Email', mockUserData.email)}
          {renderInfoItem('Phone', mockUserData.phone)}
          {renderInfoItem('Member Since', mockUserData.memberSince)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Stats</Text>
          {renderStatItem('Current Streak', `${mockUserData.healthStats.currentStreak} days`)}
          {renderStatItem('Longest Streak', `${mockUserData.healthStats.longestStreak} days`)}
          {renderStatItem('Tasks Completed', mockUserData.healthStats.tasksCompleted)}
        </View>
      </ScrollView>

      <PatientBottomNav activeTab="Profile" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  editButton: {
    padding: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E86D6D',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E86D6D',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  statValue: {
    fontSize: 16,
    color: '#4A6FFF',
    fontWeight: '600',
  },
});

export default PatientProfile; 