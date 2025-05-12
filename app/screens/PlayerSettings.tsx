import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockProfile = {
  name: 'Jennifer Favre',
  email: 'jennifer.favre@example.com',
  phone: '+41 (75) 123 4567',
  memberSince: 'April 8, 2025',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  streak: 28,
  longestStreak: 31,
  tasksCompleted: 64,
};

const PlayerSettings = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="pencil" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: mockProfile.avatar }} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{mockProfile.name}</Text>
        <Text style={styles.email}>{mockProfile.email}</Text>
        <View style={styles.streakRow}>
          <Ionicons name="time-outline" size={18} color="#222" style={{ marginRight: 4 }} />
          <Text style={styles.streakText}>{mockProfile.streak} day streak</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account Information</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Full Name</Text><Text style={styles.infoValue}>{mockProfile.name}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{mockProfile.email}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{mockProfile.phone}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Member Since</Text><Text style={styles.infoValue}>{mockProfile.memberSince}</Text></View>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Support Stats</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Current Streak</Text><Text style={styles.infoValue}>{mockProfile.streak} days</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Longest Streak</Text><Text style={styles.infoValue}>{mockProfile.longestStreak} days</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Tasks Completed</Text><Text style={styles.infoValue}>{mockProfile.tasksCompleted}</Text></View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    width: '100%',
    backgroundColor: '#6B5ECD',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12,
    position: 'relative',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    right: 24,
    top: 24,
    backgroundColor: '#A18CD1',
    borderRadius: 16,
    padding: 6,
  },
  avatarContainer: {
    marginTop: -40,
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6B5ECD',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 12,
  },
  email: {
    color: '#888',
    fontSize: 15,
    marginBottom: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakText: {
    color: '#222',
    fontSize: 15,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#222',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    color: '#888',
    fontSize: 15,
  },
  infoValue: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default PlayerSettings; 