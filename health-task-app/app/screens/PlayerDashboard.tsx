import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import PlayerBottomNav from '../components/PlayerBottomNav';

const mockTasks = [
  {
    id: 1,
    icon: <Ionicons name="arrow-down" size={24} color="#B39DFF" />,
    title: '10,000 Steps',
    desc: 'Complete 10,000 steps today',
    assignedBy: 'Self-assigned',
    frequency: 'Daily',
    status: 'due',
    risk: 1,
    riskColor: '#E86D6D',
    riskLabel: 'Due today',
    proof: false,
    proofLabel: 'Submit Proof',
    badge: { label: 'Daily', color: '#E5DEFF', textColor: '#6B5ECD' },
  },
  {
    id: 2,
    icon: <MaterialCommunityIcons name="star-four-points-outline" size={24} color="#222" />,
    title: 'Sugar-Free Day',
    desc: 'Avoid added sugars for the entire day',
    assignedBy: 'Dr. Johnson suggested',
    frequency: '3x Weekly',
    status: 'completed',
    risk: 0,
    riskColor: '#4BB543',
    riskLabel: 'Completed yesterday',
    proof: true,
    proofLabel: 'Submit Proof',
    badge: { label: '3x Weekly', color: '#E5DEFF', textColor: '#6B5ECD' },
  },
  {
    id: 3,
    icon: <Ionicons name="cart-outline" size={24} color="#222" />,
    title: 'Weekly Meal Prep',
    desc: 'Prepare healthy meals for the week',
    assignedBy: 'Self-assigned',
    frequency: 'Weekly',
    status: 'upcoming',
    risk: 1,
    riskColor: '#F6A623',
    riskLabel: 'Due in 2 days',
    proof: false,
    proofLabel: 'Submit Proof',
    badge: { label: 'Weekly', color: '#F5F5F5', textColor: '#222' },
  },
  {
    id: 4,
    icon: <MaterialCommunityIcons name="lightning-bolt-outline" size={24} color="#6B5ECD" />,
    title: '30-Min Cardio Workout',
    desc: 'Do a 30-minute cardio workout',
    assignedBy: 'Self-assigned',
    frequency: '3x Weekly',
    status: 'upcoming',
    risk: 0,
    riskColor: '#F5F5F5',
    riskLabel: '',
    proof: false,
    proofLabel: 'Submit Proof',
    badge: { label: '3x Weekly', color: '#E5DEFF', textColor: '#6B5ECD' },
  },
];

const PlayerDashboard = ({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList, 'PlayerDashboard'> }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hi, Jennifer</Text>
            <Text style={styles.subtitle}>Your health journey today</Text>
          </View>
          <Ionicons name="notifications-outline" size={24} color="#fff" style={{ marginRight: 12 }} />
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Health Tasks</Text>
          {mockTasks.map((task, idx) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={styles.taskIcon}>{task.icon}</View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={[styles.badge, { backgroundColor: task.badge.color }]}> 
                  <Text style={[styles.badgeText, { color: task.badge.textColor }]}>{task.badge.label}</Text>
                </View>
              </View>
              <Text style={styles.taskDesc}>{task.desc}</Text>
              <View style={styles.taskMetaRow}>
                <View style={styles.metaLeft}>
                  <Ionicons name="person-outline" size={16} color="#888" style={{ marginRight: 4 }} />
                  <Text style={styles.metaText}>{task.assignedBy}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PlayerSubmitProof', {
                    task: {
                      id: task.id.toString(),
                      icon: '', // icon is a component, pass empty or a string if needed
                      title: task.title,
                      description: task.desc,
                      frequency: task.frequency,
                      assignedBy: task.assignedBy,
                      risk: task.risk,
                      status: task.status,
                    }
                  })}
                >
                  <Text style={styles.proofLink}>{task.proofLabel}</Text>
                </TouchableOpacity>
              </View>
              {task.status === 'due' && (
                <View style={[styles.statusBox, { backgroundColor: '#E86D6D' }]}> 
                  <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.statusText}>Due today</Text>
                  <Text style={styles.statusText}>Risk: 1 secret</Text>
                  <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginLeft: 6 }} />
                </View>
              )}
              {task.status === 'completed' && (
                <View style={[styles.statusBox, { backgroundColor: '#4BB543' }]}> 
                  <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.statusText}>Completed yesterday</Text>
                  <Text style={styles.statusText}>Secrets safe</Text>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#fff" style={{ marginLeft: 6 }} />
                </View>
              )}
              {task.status === 'upcoming' && task.risk > 0 && (
                <View style={[styles.statusBox, { backgroundColor: '#F6A623' }]}> 
                  <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.statusText}>Due in 2 days</Text>
                  <Text style={styles.statusText}>Risk: 1 secret</Text>
                  <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginLeft: 6 }} />
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <PlayerBottomNav navigation={navigation} activeTab="Home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A18CD1', // fallback for RN
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginBottom: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#F3F0FF',
    marginBottom: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  section: {
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskIcon: {
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  taskDesc: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#888',
  },
  proofLink: {
    color: '#6B5ECD',
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    marginHorizontal: 4,
  },
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
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
});

export default PlayerDashboard; 