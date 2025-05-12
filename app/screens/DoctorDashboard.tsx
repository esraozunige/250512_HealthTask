import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import DoctorBottomNav from '../components/DoctorBottomNav';

type DoctorDashboardScreenRouteProp = RouteProp<RootStackParamList, 'DoctorDashboard'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorDashboard'>;

const DoctorDashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DoctorDashboardScreenRouteProp>();
  const doctorName = route.params?.doctorName || 'Doctor';

  const steps = [
    {
      number: '1',
      text: 'Invite patients to join your Secret Reveal group',
    },
    {
      number: '2',
      text: 'Patients invite their support network as players',
    },
    {
      number: '3',
      text: 'Assign health tasks to patients that players help monitor',
    },
    {
      number: '4',
      text: "When tasks are completed, players' secrets are revealed",
    },
  ];

  const handleInvitePress = () => {
    navigation.navigate('DoctorPatientInvitation');
  };

  const handleSettingsPress = () => {
    navigation.navigate('DoctorSettings', {
      doctorName: route.params?.doctorName,
      email: route.params?.email,
      specialization: route.params?.specialization
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Your Dashboard</Text>
            <Text style={styles.headerSubtitle}>Everything you need in one place</Text>
          </View>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={40} color="#4A6FFF" />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeTitle}>Welcome, {doctorName}!</Text>
          <Text style={styles.welcomeText}>
            Your profile is now complete. Here's what you can do next:
          </Text>

          <View style={styles.inviteCard}>
            <View style={styles.inviteIcon}>
              <Ionicons name="people" size={24} color="#4A6FFF" />
            </View>
            <View style={styles.inviteContent}>
              <Text style={styles.inviteTitle}>Invite Your First Patient</Text>
              <Text style={styles.inviteText}>
                Send invitation codes to your patients
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.inviteButton}
              onPress={handleInvitePress}
            >
              <Text style={styles.inviteButtonText}>Invite</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.howItWorksCard}>
            <Text style={styles.sectionTitle}>How Secret Reveal Works</Text>
            {steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.proTipCard}>
            <Ionicons name="information-circle" size={24} color="#4A6FFF" />
            <Text style={styles.proTipTitle}>Pro Tip</Text>
            <Text style={styles.proTipText}>
              Patients are more likely to adhere to tasks when they're specific,
              measurable, and achievable. Start with 3-5 weekly tasks for best
              results.
            </Text>
          </View>
        </View>
      </ScrollView>

      <DoctorBottomNav activeTab="Patients" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  inviteCard: {
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  inviteIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#E6EBFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inviteContent: {
    flex: 1,
    marginLeft: 16,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  inviteText: {
    fontSize: 14,
    color: '#666666',
  },
  inviteButton: {
    backgroundColor: '#4A6FFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  howItWorksCard: {
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#E6EBFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6FFF',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  proTipCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
  },
  proTipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 8,
  },
  proTipText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default DoctorDashboard; 