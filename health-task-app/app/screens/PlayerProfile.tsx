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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import PlayerBottomNav from '../components/PlayerBottomNav';

const player = {
  fullName: 'Jennifer Favre',
  email: 'jennifer.favre@example.com',
  phone: '+41 (75) 123 4567',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  memberSince: 'April 8, 2025',
  streak: 28,
  longestStreak: 31,
  tasksCompleted: 64,
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerDashboard'>;

const PlayerProfile = ({ navigation }: { navigation: NavigationProp }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="pencil-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarBox}>
          <Image source={{ uri: player.avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={20} color="#6B5ECD" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{player.fullName}</Text>
        <Text style={styles.email}>{player.email}</Text>
        <View style={styles.streakRow}>
          <Ionicons name="time-outline" size={18} color="#6B5ECD" style={{ marginRight: 4 }} />
          <Text style={styles.streakText}>{player.streak} day streak</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Account Information</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Full Name</Text><Text style={styles.infoValue}>{player.fullName}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{player.email}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{player.phone}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Member Since</Text><Text style={styles.infoValue}>{player.memberSince}</Text></View>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Support Stats</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Current Streak</Text><Text style={styles.infoValue}>{player.streak} days</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Longest Streak</Text><Text style={styles.infoValue}>{player.longestStreak} days</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Tasks Completed</Text><Text style={styles.infoValue}>{player.tasksCompleted}</Text></View>
        </View>
      </ScrollView>
      <PlayerBottomNav navigation={navigation} activeTab="Profile" />
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
  scrollContent: { alignItems: 'center', paddingBottom: 120 },
  avatarBox: { marginTop: 18, marginBottom: 8, alignItems: 'center', position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#fff' },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 110,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#B39DFF',
  },
  name: { fontSize: 20, fontWeight: 'bold', color: '#222', marginTop: 8 },
  email: { fontSize: 15, color: '#666', marginBottom: 4 },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  streakText: { color: '#6B5ECD', fontWeight: '600', fontSize: 15 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  infoTitle: { fontWeight: 'bold', fontSize: 15, color: '#222', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: { color: '#888', fontSize: 15 },
  infoValue: { color: '#222', fontWeight: '500', fontSize: 15 },
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

export default PlayerProfile; 