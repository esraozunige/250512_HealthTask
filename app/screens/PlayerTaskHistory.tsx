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
import PlayerBottomNav from '../components/PlayerBottomNav';

const mockStats = {
  completionRate: 88,
  tasksCompleted: 64,
  currentStreak: 28,
  secretsRevealed: 2,
};

const mockTasks = [
  {
    id: 1,
    icon: <Ionicons name="trending-up" size={22} color="#6B5ECD" />,
    title: 'Cardio Workout',
    desc: 'Complete 30-minute cardio session',
    date: 'Today, 2:15 PM',
    status: 'completed',
    statusLabel: 'Completed',
    statusColor: '#B6F2D6',
    statusTextColor: '#2E8B57',
    details: '35 minutes completed',
    detailsColor: '#2E8B57',
    comments: 3,
    commentsColor: '#888',
    viewColor: '#6B5ECD',
  },
  {
    id: 2,
    icon: <MaterialCommunityIcons name="star-four-points-outline" size={22} color="#222" />,
    title: 'Sugar-Free Day',
    desc: 'Avoid added sugars for the entire day',
    date: '3 days ago, 9:30 PM',
    status: 'failed',
    statusLabel: 'Failed',
    statusColor: '#F8D7DA',
    statusTextColor: '#E86D6D',
    details: 'Had dessert at dinner',
    detailsColor: '#E86D6D',
    comments: 4,
    commentsColor: '#888',
    viewColor: '#6B5ECD',
  },
  {
    id: 3,
    icon: <Ionicons name="cart-outline" size={22} color="#222" />,
    title: 'Weekly Meal Prep',
    desc: 'Prepare healthy meals for the week',
    date: '5 days ago, 11:20 AM',
    status: 'completed',
    statusLabel: 'Completed',
    statusColor: '#B6F2D6',
    statusTextColor: '#2E8B57',
    details: '5 meals prepared',
    detailsColor: '#2E8B57',
    comments: 1,
    commentsColor: '#888',
    viewColor: '#6B5ECD',
  },
];

const PlayerTaskHistory = ({ navigation }: { navigation: any }) => {
  const [period, setPeriod] = useState('This Month');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task History</Text>
        </View>
        <View style={styles.section}>
          <View style={styles.performanceHeader}>
            <Text style={styles.sectionTitle}>Task Performance</Text>
            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodText}>{period}</Text>
              <Ionicons name="chevron-down" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Completion Rate</Text>
              <Text style={styles.statValue}>{mockStats.completionRate}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tasks Completed</Text>
              <Text style={styles.statValue}>{mockStats.tasksCompleted}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statValue}>{mockStats.currentStreak}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Secrets Revealed</Text>
              <Text style={styles.statValue}>{mockStats.secretsRevealed}</Text>
            </View>
          </View>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Tasks</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter-outline" size={20} color="#6B5ECD" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>
          {mockTasks.map((task, idx) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskRow}>
                <View style={styles.taskIcon}>{task.icon}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDesc}>{task.desc}</Text>
                  <Text style={styles.taskDate}>{task.date}</Text>
                  <View style={styles.taskDetailsRow}>
                    {task.status === 'completed' && (
                      <>
                        <Ionicons name="checkmark" size={16} color={task.detailsColor} style={{ marginRight: 2 }} />
                        <Text style={[styles.taskDetails, { color: task.detailsColor }]}>{task.details}</Text>
                      </>
                    )}
                    {task.status === 'failed' && (
                      <>
                        <Ionicons name="close" size={16} color={task.detailsColor} style={{ marginRight: 2 }} />
                        <Text style={[styles.taskDetails, { color: task.detailsColor }]}>{task.details}</Text>
                      </>
                    )}
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color={task.commentsColor} style={{ marginLeft: 12, marginRight: 2 }} />
                    <Text style={[styles.taskComments, { color: task.commentsColor }]}>{task.comments} comments</Text>
                    <TouchableOpacity>
                      <Text style={[styles.taskView, { color: task.viewColor }]}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: task.status === 'completed' ? '#E6F9F0' : task.status === 'failed' ? '#F8D7DA' : '#EEE' }] }>
                  <Text style={[styles.statusBadgeText, { color: task.status === 'completed' ? '#2E8B57' : task.status === 'failed' ? '#E86D6D' : '#888' }]}>{task.statusLabel}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <PlayerBottomNav navigation={navigation} activeTab="Tasks" />
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
    backgroundColor: '#A18CD1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    marginBottom: 12,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  periodText: {
    fontSize: 15,
    color: '#222',
    marginRight: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  statBox: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    color: '#6B5ECD',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 2,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  taskDesc: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  taskDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  taskDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  taskDetails: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  taskComments: {
    fontSize: 14,
    color: '#888',
    marginRight: 4,
  },
  taskView: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
    marginTop: 2,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default PlayerTaskHistory; 