import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlayerBottomNavProps {
  navigation: any;
  activeTab: 'Home' | 'Tasks' | 'Group' | 'Profile';
}

const PlayerBottomNav: React.FC<PlayerBottomNavProps> = ({ navigation, activeTab }) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => navigation.navigate('PlayerDashboard')}
    >
      <Ionicons name="home" size={24} color={activeTab === 'Home' ? '#6B5ECD' : '#888'} />
      <Text style={[styles.navText, activeTab === 'Home' && styles.activeNavText]}>Home</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => navigation.navigate('PlayerTaskHistory')}
    >
      <Ionicons name="checkbox-outline" size={24} color={activeTab === 'Tasks' ? '#6B5ECD' : '#888'} />
      <Text style={[styles.navText, activeTab === 'Tasks' && styles.activeNavText]}>Tasks</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => navigation.navigate('PlayerGroup')}
    >
      <Ionicons name="people-outline" size={24} color={activeTab === 'Group' ? '#6B5ECD' : '#888'} />
      <Text style={[styles.navText, activeTab === 'Group' && styles.activeNavText]}>Group</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.navItem}
      onPress={() => navigation.navigate('PlayerSettings')}
    >
      <Ionicons name="person-outline" size={24} color={activeTab === 'Profile' ? '#6B5ECD' : '#888'} />
      <Text style={[styles.navText, activeTab === 'Profile' && styles.activeNavText]}>Profile</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
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
  navText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#6B5ECD',
  },
});

export default PlayerBottomNav; 