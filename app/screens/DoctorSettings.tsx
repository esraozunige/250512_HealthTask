import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import DoctorBottomNav from '../components/DoctorBottomNav';
import { useDoctor } from '../context/DoctorContext';
import { supabase } from '../../lib/supabase';

const DoctorSettings = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DoctorSettings'>>();
  const { doctor, setDoctor } = useDoctor();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  useEffect(() => {
    if (route.params?.doctorName) {
      setDoctor({
        fullName: route.params.doctorName,
        email: route.params.email || '',
        specialty: route.params.specialization || '',
        hospital: '',
        aboutMe: '',
      });
    }
  }, [route.params, setDoctor]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setDoctor({} as any); // Clear doctor context (set to empty object)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Landing' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!doctor) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading doctor info...</Text>
      </SafeAreaView>
    );
  }

  // Fallbacks for name and specialty
  const displayName = doctor.fullName && doctor.fullName.trim() ? `Dr. ${doctor.fullName}` : `Dr. ${doctor.email}`;
  const displaySpecialty = doctor.specialty && doctor.specialty.trim() ? doctor.specialty : 'Specialty not set';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
            {doctor.profilePhotoUrl ? (
              <Image source={{ uri: doctor.profilePhotoUrl }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Ionicons name="person" size={24} color="#B0B0B0" />
              </View>
            )}
          </View>
        </View>

        {/* Profile Card - Centered and aligned */}
        <View style={styles.profileCardCentered}>
          {doctor.profilePhotoUrl ? (
            <Image source={{ uri: doctor.profilePhotoUrl }} style={styles.profileAvatarLarge} />
          ) : (
            <View style={styles.profileAvatarLargePlaceholder}>
              <Ionicons name="person" size={48} color="#B0B0B0" />
            </View>
          )}
          <Text style={styles.profileNameLarge}>{displayName}</Text>
          <Text style={styles.profileSpecialtyLarge}>{displaySpecialty}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DoctorProfile', { editMode: true })}>
            <Text style={styles.editProfileLinkLarge}>✎ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('DoctorProfile', { editMode: true })}>
            <Ionicons name="person-circle-outline" size={24} color="#7B8EF9" style={styles.rowIcon} />
            <Text style={styles.rowText}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('DoctorPatientInvitation', undefined)}>
            <Ionicons name="person-add-outline" size={24} color="#7B8EF9" style={styles.rowIcon} />
            <Text style={styles.rowText}>Invite Patients</Text>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Ionicons name="lock-closed-outline" size={24} color="#7B8EF9" style={styles.rowIcon} />
            <Text style={styles.rowText}>Password & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.sectionCard}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={24} color="#7B8EF9" style={styles.rowIcon} />
            <Text style={styles.rowText}>Push Notifications</Text>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E5E5E5', true: '#7B8EF9' }}
              thumbColor={pushEnabled ? '#4A6FFF' : '#ccc'}
              style={{ marginLeft: 'auto' }}
            />
          </View>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={24} color="#7B8EF9" style={styles.rowIcon} />
            <Text style={styles.rowText}>Email Notifications</Text>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#E5E5E5', true: '#7B8EF9' }}
              thumbColor={emailEnabled ? '#4A6FFF' : '#ccc'}
              style={{ marginLeft: 'auto' }}
            />
          </View>
          <TouchableOpacity style={styles.row}>
            <Ionicons name="settings-outline" size={24} color="#7B8EF9" style={styles.rowIcon} />
            <Text style={styles.rowText}>Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color="#B0B0B0" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Privacy Section */}
        <Text style={styles.sectionHeader}>Privacy</Text>
        {/* Add privacy rows here if needed */}
        <View style={{ height: 32 }} />
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <DoctorBottomNav activeTab="Profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollView: { flex: 1 },
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
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 6,
    marginRight: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  // Centered profile card styles
  profileCardCentered: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginTop: -32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  profileAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  profileAvatarLargePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E6EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileNameLarge: { fontWeight: 'bold', fontSize: 20, color: '#222', marginBottom: 2, textAlign: 'center' },
  profileSpecialtyLarge: { color: '#888', fontSize: 15, marginBottom: 2, textAlign: 'center' },
  editProfileLinkLarge: { color: '#4A6FFF', fontWeight: 'bold', fontSize: 14, marginTop: 4, marginBottom: 2, textAlign: 'center' },
  sectionHeader: { fontWeight: 'bold', fontSize: 18, color: '#222', marginLeft: 28, marginTop: 18, marginBottom: 8 },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 18,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowIcon: { marginRight: 16 },
  rowText: { fontSize: 16, color: '#222', fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DoctorSettings; 