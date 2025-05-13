import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

const FILTERS = ['All Tasks', 'Active', 'Completed'];

const mockTasks = [
  {
    id: '1',
    icon: <MaterialCommunityIcons name="food" size={22} color="#A18CD1" />, // Healthy Meal
    title: 'Healthy Meal',
    desc: 'Post a photo of your healthy dinner',
    badge: 'Daily',
    badgeColor: '#E5DEFF',
    created: 'Created 3 days ago',
    status: 'Completed',
    statusColor: '#4BB543',
    statusText: 'Completed today',
    supporter: 'Supporting Deen',
    supporterColor: '#4BB543',
  },
  {
    id: '2',
    icon: <MaterialCommunityIcons name="book-open-page-variant" size={22} color="#F6A623" />, // Read Health Book
    title: 'Read Health Book',
    desc: 'Read at least one chapter of health book',
    badge: 'Weekly',
    badgeColor: '#FFF6E5',
    created: 'Created 1 week ago',
    status: 'Due',
    statusColor: '#F6A623',
    statusText: 'Due in 3 days',
    supporter: 'Supporting Deen',
    supporterColor: '#F6A623',
  },
  {
    id: '3',
    icon: <MaterialCommunityIcons name="walk" size={22} color="#6B5ECD" />, // Daily Walk
    title: 'Daily Walk',
    desc: 'Walk at least 8,000 steps today',
    badge: 'Daily',
    badgeColor: '#E5DEFF',
    created: 'Created 2 weeks ago',
    status: 'Due',
    statusColor: '#E86D6D',
    statusText: 'Due in 5 hours',
    supporter: 'Supporting Deen',
    supporterColor: '#E86D6D',
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerDashboard'>;

const PlayerManageTasks = () => {
  const navigation = useNavigation<NavigationProp>();
  const [filter, setFilter] = useState(FILTERS[0]);

  // Filtering logic for mockup
  const filteredTasks =
    filter === 'All Tasks'
      ? mockTasks
      : filter === 'Active'
      ? mockTasks.filter(t => t.status === 'Due')
      : mockTasks.filter(t => t.status === 'Completed');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.createTaskBox}>
          <Ionicons name="add" size={22} color="#6B5ECD" style={{ marginRight: 8 }} />
          <Text style={styles.createTaskText}>Create New Task</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Your Tasks</Text>
        {filteredTasks.map(task => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={styles.taskIcon}>{task.icon}</View>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={[styles.badge, { backgroundColor: task.badgeColor }]}> 
                <Text style={styles.badgeText}>{task.badge}</Text>
              </View>
            </View>
            <Text style={styles.taskDesc}>{task.desc}</Text>
            <Text style={styles.taskCreated}>{task.created}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <View style={[styles.statusBox, { backgroundColor: task.statusColor === '#4BB543' ? '#E6F9ED' : task.statusColor === '#F6A623' ? '#FFF6E5' : '#FDE8E8' }]}> 
              <Ionicons name={task.status === 'Completed' ? 'checkmark-circle' : 'time-outline'} size={18} color={task.statusColor} style={{ marginRight: 6 }} />
              <Text style={[styles.statusText, { color: task.statusColor }]}>{task.statusText}</Text>
              <Text style={[styles.statusText, { color: task.supporterColor }]}>{task.supporter}</Text>
              <Ionicons name="heart-outline" size={18} color={task.supporterColor} style={{ marginLeft: 6 }} />
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.createTaskButton}>
          <Ionicons name="add" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.createTaskButtonText}>Create New Task</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerDashboard')}>
          <Ionicons name="home" size={24} color="#888" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="checkbox-outline" size={24} color="#6B5ECD" />
          <Text style={[styles.navLabel, { color: '#6B5ECD' }]}>Tasks</Text>
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
    justifyContent: 'space-between',
    backgroundColor: '#6B5ECD',
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerIcon: { padding: 4 },
  headerTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  scrollContent: { paddingBottom: 120 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#6B5ECD',
  },
  filterText: { color: '#888', fontWeight: '600', fontSize: 15 },
  filterTextActive: { color: '#fff' },
  createTaskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DEFF',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: '#fff',
  },
  createTaskText: { color: '#6B5ECD', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontWeight: 'bold', fontSize: 17, color: '#222', marginLeft: 18, marginBottom: 8 },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  taskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  taskIcon: { marginRight: 10 },
  taskTitle: { fontSize: 17, fontWeight: 'bold', color: '#222', flex: 1 },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#6B5ECD' },
  taskDesc: { fontSize: 15, color: '#444', marginBottom: 2 },
  taskCreated: { fontSize: 13, color: '#888', marginBottom: 8 },
  editButton: { alignSelf: 'flex-end', marginBottom: 8 },
  editText: { color: '#6B5ECD', fontWeight: '600', fontSize: 15, textDecorationLine: 'underline' },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  statusText: { fontWeight: '600', fontSize: 15, marginHorizontal: 4 },
  createTaskButton: {
    backgroundColor: '#6B5ECD',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  createTaskButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
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

export default PlayerManageTasks; 