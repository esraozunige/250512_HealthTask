import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

const mockSecrets = [
  {
    id: '1',
    text: 'I secretly binge-watched an entire season of The Bachelor last weekend instead of going to the gym.',
    status: 'Revealed',
    date: '1 day ago',
  },
  {
    id: '2',
    text: "I tell everyone I'm a morning person, but I hit snooze at least 5 times every day.",
    status: 'Safe',
    date: 'Added 2 weeks ago',
  },
  {
    id: '3',
    text: "I've never actually read any of the books I recommend to people at parties.",
    status: 'Safe',
    date: 'Added 2 weeks ago',
  },
  {
    id: '4',
    text: 'I pretend to like kale smoothies but I secretly hate them.',
    status: 'Safe',
    date: 'Added 2 weeks ago',
  },
];

const FILTERS = ['All Secrets', 'Safe', 'Revealed'];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerDashboard'>;

const PlayerManageSecrets = () => {
  const navigation = useNavigation<NavigationProp>();
  const [filter, setFilter] = useState(FILTERS[0]);

  const filteredSecrets = filter === 'All Secrets' ? mockSecrets : mockSecrets.filter(s => s.status === filter);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Secrets</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <Ionicons name="lock-closed-outline" size={24} color="#B39DFF" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Your Secrets are Secure</Text>
            <Text style={styles.infoDesc}>Secrets are encrypted and only revealed to your friends if you miss your health goals. You can edit unrevealed secrets at any time.</Text>
          </View>
        </View>
        <View style={styles.secretsHeader}>
          <Text style={styles.secretsTitle}>Your Secrets</Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => {
            // Cycle through filters for mockup
            const idx = FILTERS.indexOf(filter);
            setFilter(FILTERS[(idx + 1) % FILTERS.length]);
          }}>
            <Text style={styles.filterText}>{filter}</Text>
            <Ionicons name="chevron-down" size={18} color="#888" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredSecrets}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.secretCard}>
              <Ionicons name="lock-closed-outline" size={20} color="#B39DFF" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.secretText}>{item.text}</Text>
                <View style={styles.secretMetaRow}>
                  <View style={[styles.statusBadge, item.status === 'Revealed' ? styles.revealedBadge : styles.safeBadge]}>
                    <Text style={[styles.statusBadgeText, item.status === 'Revealed' ? styles.revealedText : styles.safeText]}>{item.status}</Text>
                  </View>
                  <Text style={styles.secretDate}>{item.date}</Text>
                </View>
              </View>
              {item.status !== 'Revealed' && (
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="pencil-outline" size={18} color="#B39DFF" />
                </TouchableOpacity>
              )}
            </View>
          )}
          style={{ width: '100%' }}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerDashboard')}>
          <Ionicons name="home" size={24} color="#888" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerTaskHistory')}>
          <Ionicons name="checkbox-outline" size={24} color="#888" />
          <Text style={styles.navLabel}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('PlayerGroup')}>
          <Ionicons name="people-outline" size={24} color="#888" />
          <Text style={styles.navLabel}>Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#6B5ECD" />
          <Text style={[styles.navLabel, { color: '#6B5ECD' }]}>Profile</Text>
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
  scrollContent: { paddingBottom: 20 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 16,
    margin: 18,
    marginBottom: 8,
    gap: 8,
  },
  infoTitle: { fontWeight: 'bold', fontSize: 15, color: '#6B5ECD', marginBottom: 2 },
  infoDesc: { fontSize: 13, color: '#666' },
  secretsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  secretsTitle: { fontWeight: 'bold', fontSize: 17, color: '#222' },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterText: { color: '#6B5ECD', fontWeight: '600', fontSize: 15, marginRight: 2 },
  secretCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: 8,
  },
  secretText: { flex: 1, fontSize: 15, color: '#222' },
  secretMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  safeBadge: { backgroundColor: '#E5DEFF' },
  revealedBadge: { backgroundColor: '#FDE8E8' },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },
  safeText: { color: '#6B5ECD' },
  revealedText: { color: '#E86D6D' },
  secretDate: { fontSize: 13, color: '#888' },
  editButton: { marginLeft: 8, padding: 4 },
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

export default PlayerManageSecrets; 