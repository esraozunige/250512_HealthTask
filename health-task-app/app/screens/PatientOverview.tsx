import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type PatientOverviewRouteProp = RouteProp<RootStackParamList, 'PatientOverview'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PatientOverview = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PatientOverviewRouteProp>();
  const { patient } = route.params;

  const handleAssignTask = () => {
    navigation.navigate({ 
      name: 'DoctorTaskManagement', 
      params: { updatedTask: undefined }
    });
  };

  const handleGroupPress = () => {
    navigation.navigate({ name: 'PatientGroup', params: undefined });
  };

  const handleViewAll = () => {
    navigation.navigate({ name: 'PatientGroup', params: undefined });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text style={styles.headerTitle}>Patient Overview</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#4A6FFF" />
          </View>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.lastActive}>Last active: Yesterday</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Needs Attention</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>days</Text>
            <Ionicons name="flame" size={16} color="#4A6FFF" />
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>67%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Missed</Text>
          </View>
        </View>

        <View style={styles.secretSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Secret Reveal Status</Text>
            <View style={styles.riskBadge}>
              <Text style={styles.riskText}>2 at risk</Text>
            </View>
          </View>
          <Text style={styles.secretInfo}>1 secret revealed</Text>
          <Text style={styles.lastReveal}>Last reveal: 2 days ago</Text>
        </View>

        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Current Tasks</Text>
            <TouchableOpacity onPress={handleAssignTask}>
              <Text style={styles.assignLink}>Assign Task</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taskCard}>
            <View style={[styles.taskIcon, styles.overdueTask]}>
              <Ionicons name="time" size={24} color="#FF6B6B" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>Daily Blood Pressure Check</Text>
              <Text style={styles.taskDue}>Due today</Text>
            </View>
            <View style={styles.taskStatus}>
              <Text style={styles.overdueText}>Overdue</Text>
            </View>
          </View>

          <View style={styles.taskCard}>
            <View style={[styles.taskIcon, styles.upcomingTask]}>
              <Ionicons name="medical" size={24} color="#4A6FFF" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>Medication Reminder</Text>
              <Text style={styles.taskDue}>Due in 3 hours</Text>
            </View>
            <View style={styles.taskStatus}>
              <Text style={styles.upcomingText}>Upcoming</Text>
            </View>
          </View>

          <View style={styles.taskCard}>
            <View style={[styles.taskIcon, styles.completedTask]}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>Daily Walk</Text>
              <Text style={styles.taskDue}>Completed today</Text>
            </View>
            <View style={styles.taskStatus}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate({ name: 'DoctorPatients', params: undefined })}
        >
          <Ionicons name="people" size={24} color="#666" />
          <Text style={styles.navText}>Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate({ 
            name: 'DoctorTaskManagement', 
            params: { updatedTask: undefined }
          })}
        >
          <Ionicons name="clipboard-outline" size={24} color="#666" />
          <Text style={styles.navText}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="people-outline" size={24} color="#666" />
          <Text style={styles.navText}>Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="settings-outline" size={24} color="#666" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4A6FFF',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    margin: 4,
    borderRadius: 12,
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
  secretSection: {
    backgroundColor: '#F5F7FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  riskBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  secretInfo: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  lastReveal: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  tasksSection: {
    margin: 16,
  },
  assignLink: {
    color: '#4A6FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overdueTask: {
    backgroundColor: '#FFE5E5',
  },
  upcomingTask: {
    backgroundColor: '#E6EBFF',
  },
  completedTask: {
    backgroundColor: '#E8F5E9',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  taskDue: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  taskStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  upcomingText: {
    color: '#4A6FFF',
    fontWeight: '600',
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  navText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});

export default PatientOverview; 