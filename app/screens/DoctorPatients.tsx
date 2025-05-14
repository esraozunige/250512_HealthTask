import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import DoctorBottomNav from '../components/DoctorBottomNav';
import { supabase } from '../../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorPatients'>;
type DoctorPatientsRouteProp = RouteProp<RootStackParamList, 'DoctorPatients'>;

type Patient = {
  id: string;
  name: string;
  image: string;
  status: 'Good' | 'Needs Attention';
  streak: number;
  lastActivity: string;
  tasksStatus: 'All complete' | string;
  email?: string;
  invitationCode?: string;
  registrationDate?: string;
  type: 'active' | 'pending' | 'needs_help';
};

const DoctorPatients = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Active Patients' | 'Pending Invites'>('Active Patients');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const stats = {
    active: patients.filter(p => p.type === 'active').length,
    needsHelp: patients.filter(p => p.status === 'Needs Attention').length,
    avgStreak: '14d',
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const user = await supabase.auth.user();
      if (!user) throw new Error('No user found');

      // 1. Find all group_ids where the doctor is a member with role 'doctor'
      const { data: doctorGroups, error: doctorGroupsError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .eq('role', 'doctor');
      if (doctorGroupsError) throw doctorGroupsError;
      const groupIds = (doctorGroups || []).map((g: any) => g.group_id);

      if (!groupIds.length) {
        setPatients([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch group members who are patients in these groups
      const { data: members, error: memberError } = await supabase
        .from('group_members')
        .select('user_id')
        .in('group_id', groupIds)
        .eq('role', 'patient');
      if (memberError) throw memberError;
      const patientIds = (members || []).map((m: any) => m.user_id);

      if (!patientIds.length) {
        setPatients([]);
        setIsLoading(false);
        return;
      }

      // 3. Fetch patient user details, including streak_category
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, full_name, email, streak_category, current_streak, longest_streak')
        .in('id', patientIds);
      if (userError) throw userError;

      setPatients(users?.map((user: any) => ({
        id: user.id,
        name: user.full_name,
        image: '',
        status: user.streak_category === 'needs_help' ? 'Needs Attention' : 'Good',
        streak: user.current_streak,
        lastActivity: `${user.current_streak} days`,
        tasksStatus: user.streak_category === 'needs_help' ? '2 missed' : 'All complete',
        email: user.email,
        type: user.streak_category === 'needs_help' ? 'needs_help' : user.streak_category === 'active' ? 'active' : 'pending',
      })) || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'Active Patients' ? 
                      patient.type === 'active' : 
                      patient.type === 'pending';
    return matchesSearch && matchesTab;
  });

  const renderPatientCard = (patient: Patient) => (
    <TouchableOpacity 
      key={patient.id} 
      style={styles.patientCard}
      onPress={() => navigation.navigate('PatientOverview', { patient })}
    >
      <View style={styles.patientInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={32} color="#4A6FFF" />
        </View>
        <View style={styles.patientDetails}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: patient.type === 'pending' ? '#FFA500' : 
                               patient.status === 'Good' ? '#4CAF50' : '#FF6B6B' }
            ]} />
            <Text style={styles.statusText}>
              {patient.type === 'pending' ? 'Pending' : patient.status}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.streakContainer}>
        {patient.type === 'active' ? (
          <>
            <Ionicons name="flame" size={16} color="#4A6FFF" />
            <Text style={styles.streakText}>{patient.lastActivity}</Text>
            <View style={styles.taskStatus}>
              {patient.tasksStatus === 'All complete' ? (
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              ) : (
                <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
              )}
              <Text style={[
                styles.taskStatusText,
                { color: patient.tasksStatus === 'All complete' ? '#4CAF50' : '#FF6B6B' }
              ]}>
                {patient.tasksStatus}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.pendingText}>Awaiting registration</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Patients</Text>
          <View style={styles.notificationIcon}>
            <Ionicons name="notifications" size={24} color="white" />
          </View>
        </View>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={40} color="white" />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.needsHelp}</Text>
          <Text style={styles.statLabel}>Needs Help</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.avgStreak}</Text>
          <Text style={styles.statLabel}>Avg. Streak</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Active Patients' && styles.activeTab]}
          onPress={() => setActiveTab('Active Patients')}
        >
          <Text style={[styles.tabText, activeTab === 'Active Patients' && styles.activeTabText]}>
            Active Patients ({patients.filter(p => p.type === 'active').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Pending Invites' && styles.activeTab]}
          onPress={() => setActiveTab('Pending Invites')}
        >
          <Text style={[styles.tabText, activeTab === 'Pending Invites' && styles.activeTabText]}>
            Pending Invites ({patients.filter(p => p.type === 'pending').length})
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Patient List</Text>

      <ScrollView style={styles.patientList}>
        {filteredPatients.map(renderPatientCard)}
      </ScrollView>

      <TouchableOpacity
        style={styles.inviteButton}
        onPress={() => navigation.navigate('DoctorPatientInvitation')}
      >
        <Ionicons name="add" size={20} color="#4A6FFF" />
        <Text style={styles.inviteButtonText}>Invite New Patient</Text>
      </TouchableOpacity>

      <DoctorBottomNav activeTab="Patients" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#4A6FFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationIcon: {
    position: 'absolute',
    right: -30,
    top: 0,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A6FFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#4A6FFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    margin: 16,
  },
  patientList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666666',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakText: {
    fontSize: 14,
    color: '#4A6FFF',
    marginLeft: 4,
    marginRight: 12,
  },
  taskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskStatusText: {
    fontSize: 14,
    marginLeft: 4,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6EBFF',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6FFF',
    marginLeft: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#FFA500',
  },
});

export default DoctorPatients; 