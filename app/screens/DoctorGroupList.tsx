import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import DoctorBottomNav from '../components/DoctorBottomNav';
import { supabase } from '../../lib/supabase';

// Mock data for demonstration
const mockGroups = [
  {
    id: '1',
    name: 'Deen Rufus',
    members: 3,
    status: 'Active',
    lastActivity: 'Updated today',
    tasks: 4,
    avatars: [
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/men/45.jpg',
    ],
    unread: 5,
  },
  {
    id: '2',
    name: 'Emilie Jackson',
    members: 5,
    status: 'Active',
    lastActivity: '2 days ago',
    tasks: 3,
    avatars: [
      'https://randomuser.me/api/portraits/women/65.jpg',
      'https://randomuser.me/api/portraits/men/46.jpg',
      'https://randomuser.me/api/portraits/women/66.jpg',
      'https://randomuser.me/api/portraits/men/47.jpg',
      'https://randomuser.me/api/portraits/women/67.jpg',
    ],
    unread: 2,
  },
  {
    id: '3',
    name: 'Alex Coral',
    members: 4,
    status: 'Active',
    lastActivity: '1 week ago',
    tasks: 2,
    avatars: [
      'https://randomuser.me/api/portraits/men/48.jpg',
      'https://randomuser.me/api/portraits/women/68.jpg',
      'https://randomuser.me/api/portraits/men/49.jpg',
      'https://randomuser.me/api/portraits/women/69.jpg',
    ],
    unread: 0,
  },
  {
    id: '4',
    name: 'Mehmet',
    members: 2,
    status: 'Active',
    lastActivity: 'Today',
    tasks: 1,
    avatars: [
      'https://randomuser.me/api/portraits/men/50.jpg',
      'https://randomuser.me/api/portraits/men/51.jpg',
    ],
    unread: 1,
    doctorEmail: 'figurly3d@gmail.com',
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorGroupList'>;

const DoctorGroupList = () => {
  const navigation = useNavigation<NavigationProp>();
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState(mockGroups);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        // 1. Get current doctor user
        const user = await supabase.auth.user();
        if (!user) throw new Error('No user found');
        // 2. Get all group_ids where doctor is a member
        const { data: groupMembers, error: groupMembersError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('role', 'doctor');
        if (groupMembersError) throw groupMembersError;
        const groupIds = (groupMembers || []).map(g => g.group_id);
        if (!groupIds.length) {
          setGroups(mockGroups);
          setLoading(false);
          return;
        }
        // 3. For each group_id, fetch group details
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('id')
          .in('id', groupIds);
        if (groupError) throw groupError;
        // 4. For each group, fetch members and tasks count, and patient name(s)
        const realGroups = await Promise.all(
          (groupData || []).map(async (group) => {
            // Members count
            const { count: membersCount } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id);
            // Tasks count
            const { count: tasksCount } = await supabase
              .from('tasks')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_by', user.id)
              .eq('status', 'pending');
            // Patient(s) in this group
            const { data: patientMembers } = await supabase
              .from('group_members')
              .select('user_id')
              .eq('group_id', group.id)
              .eq('role', 'patient');
            let patientNames = '';
            if (patientMembers && patientMembers.length > 0) {
              const patientIds = patientMembers.map(pm => pm.user_id);
              const { data: patientUsers } = await supabase
                .from('users')
                .select('full_name')
                .in('id', patientIds);
              patientNames = (patientUsers || []).map(u => u.full_name).join(', ');
            }
            return {
              id: group.id,
              name: patientNames || 'Patient Group',
              members: membersCount || 0,
              status: 'Active',
              lastActivity: 'Today',
              tasks: tasksCount || 0,
              avatars: [],
              unread: 0,
            };
          })
        );
        // 5. Merge real groups with mock groups (avoid duplicates by id)
        const allGroups = [
          ...realGroups.filter(rg => !mockGroups.some(mg => mg.id === rg.id)),
          ...mockGroups,
        ];
        setGroups(allGroups);
      } catch (e) {
        setGroups(mockGroups);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Filter groups by search
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalGroups = groups.length;
  const totalMembers = groups.reduce((sum, g) => sum + g.members, 0);
  const totalTasks = groups.reduce((sum, g) => sum + g.tasks, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Groups</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications" size={24} color="#4A6FFF" />
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={24} color="#4A6FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.tabsRow}>
          <Text style={[styles.tab, styles.activeTab]}>Groups</Text>
          <Text style={styles.tab}>Recent</Text>
        </View>
        <View style={styles.statsCard}>
          <View style={styles.statBox}><Text style={styles.statValue}>{totalGroups}</Text><Text style={styles.statLabel}>Total Groups</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{totalMembers}</Text><Text style={styles.statLabel}>Members</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{totalTasks}</Text><Text style={styles.statLabel}>Active Tasks</Text></View>
          <TouchableOpacity style={styles.viewAll}><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
        </View>
        <ScrollView style={styles.groupsList} contentContainerStyle={{ paddingBottom: 16 }}>
          {filteredGroups.map(group => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => navigation.navigate('DoctorGroup', { group_id: group.id })}
            >
              <View style={styles.groupCardHeader}>
                <Ionicons name="people" size={24} color="#4A6FFF" style={{ marginRight: 8 }} />
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupStatus}>• {group.status}</Text>
                {group.unread > 0 && (
                  <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{group.unread}</Text></View>
                )}
              </View>
              <View style={styles.groupCardDetails}>
                <View style={styles.avatarsRow}>
                  {group.avatars.map((avatar, idx) => (
                    <View key={idx} style={[styles.avatarWrapper, { left: idx * -10 }] }>
                      <View style={styles.avatarCircle}>
                        <Ionicons name="person" size={16} color="#fff" />
                      </View>
                    </View>
                  ))}
                </View>
                <Text style={styles.groupInfo}>{group.members} members</Text>
                <Ionicons name="calendar" size={16} color="#4A6FFF" style={{ marginLeft: 8 }} />
                <Text style={styles.groupInfo}>{group.lastActivity}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#4A6FFF" style={{ marginLeft: 8 }} />
                <Text style={styles.groupInfo}>{group.tasks} tasks</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <DoctorBottomNav activeTab="Groups" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#4A6FFF' },
  headerIcon: { marginLeft: 12 },
  badge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#E86D6D', borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, margin: 16, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 16 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E5E5', marginHorizontal: 16 },
  tab: { paddingVertical: 12, marginRight: 24, fontSize: 16, color: '#666' },
  activeTab: { color: '#4A6FFF', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#4A6FFF' },
  statsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, margin: 16, padding: 16, position: 'relative' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#4A6FFF' },
  statLabel: { fontSize: 12, color: '#666' },
  viewAll: { position: 'absolute', right: 16, top: 12 },
  viewAllText: { color: '#4A6FFF', fontWeight: 'bold', fontSize: 13 },
  groupsList: { flex: 1, paddingHorizontal: 16 },
  groupCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  groupCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  groupName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  groupStatus: { fontSize: 13, color: '#4A6FFF', marginLeft: 8 },
  unreadBadge: { backgroundColor: '#E86D6D', borderRadius: 10, paddingHorizontal: 6, marginLeft: 8 },
  unreadBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  groupCardDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  avatarsRow: { flexDirection: 'row', marginRight: 8 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4A6FFF', alignItems: 'center', justifyContent: 'center', marginRight: 2 },
  groupInfo: { fontSize: 13, color: '#666', marginLeft: 4 },
});

export default DoctorGroupList; 