import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import { getMySecrets } from '../lib/secrets';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientManageSecrets'>;

interface Secret {
  id: string;
  content: string;
  status: 'Safe' | 'Revealed';
  addedDate: string;
  revealedDate?: string;
}

const mockSecrets: Secret[] = [
  {
    id: '1',
    content: 'I accidentally ate dog food last week. Not once, but twice.',
    status: 'Revealed',
    addedDate: '2 days ago',
    revealedDate: '2 days ago',
  },
  {
    id: '2',
    content: 'I handed a counterfeit banknote to my hairdresser, even though I knew it was fake.',
    status: 'Safe',
    addedDate: '3 weeks ago',
  },
  {
    id: '3',
    content: 'No one knows this, but I secretly watch Indian Matchmaking every single day.',
    status: 'Safe',
    addedDate: '3 weeks ago',
  },
  {
    id: '4',
    content: "I've been lying about my daily step count to my friends. I rarely hit 10,000 steps.",
    status: 'Safe',
    addedDate: '3 weeks ago',
  },
];

const PatientManageSecrets = () => {
  const navigation = useNavigation<NavigationProp>();
  const [secrets, setSecrets] = useState<any[]>([]);
  const [filter, setFilter] = useState<'All Secrets' | 'Safe' | 'Revealed'>('All Secrets');
  const [groupId, setGroupId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupId = async () => {
      const session = supabase.auth.session();
      const userId = session?.user?.id;
      if (!userId) {
        Alert.alert('Error', 'You must be logged in to manage secrets');
        return;
      }

      const { data, error } = await supabase
        .from('user_groups')
        .select('group_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to fetch group information');
        return;
      }

      setGroupId(data?.group_id);
    };

    fetchGroupId();
  }, []);

  useEffect(() => {
    const fetchSecrets = async () => {
      try {
        const data = await getMySecrets();
        setSecrets(data || []);
      } catch (e) {
        Alert.alert('Error', 'Failed to fetch secrets');
      }
    };
    fetchSecrets();
  }, []);

  const filteredSecrets = secrets.filter(secret => {
    if (filter === 'All Secrets') return true;
    return secret.status === filter;
  });

  const renderSecret = (secret: Secret) => (
    <View key={secret.id} style={styles.secretItem}>
      <View style={styles.secretContent}>
        <Ionicons 
          name="lock-closed" 
          size={20} 
          color={secret.status === 'Revealed' ? '#E86D6D' : '#4A6FFF'} 
        />
        <Text style={styles.secretText}>{secret.content}</Text>
      </View>
      <View style={styles.secretMeta}>
        <View style={[
          styles.statusBadge,
          secret.status === 'Revealed' ? styles.revealedBadge : styles.safeBadge
        ]}>
          <Text style={[
            styles.statusText,
            secret.status === 'Revealed' ? styles.revealedText : styles.safeText
          ]}>
            {secret.status}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {secret.status === 'Revealed' 
            ? `Revealed ${secret.revealedDate}`
            : `Added ${secret.addedDate}`
          }
        </Text>
        {secret.status !== 'Revealed' && (
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Manage Secrets</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (!groupId) {
              Alert.alert('Error', 'Group information not found');
              return;
            }
            navigation.navigate({ 
              name: 'PatientAddSecrets', 
              params: { group_id: groupId }
            });
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="lock-closed" size={24} color="#4A6FFF" />
          <Text style={styles.infoTitle}>Your Secrets are Secure</Text>
          <Text style={styles.infoDescription}>
            Secrets are encrypted and only revealed to your friends if you miss your health goals. You can edit unrevealed secrets at any time.
          </Text>
        </View>

        <View style={styles.secretsSection}>
          <View style={styles.secretsHeader}>
            <Text style={styles.secretsTitle}>Your Secrets</Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                // Cycle through filter options
                if (filter === 'All Secrets') setFilter('Safe');
                else if (filter === 'Safe') setFilter('Revealed');
                else setFilter('All Secrets');
              }}
            >
              <Text style={styles.filterText}>{filter}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {filteredSecrets.map(renderSecret)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#E86D6D',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  infoBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  secretsSection: {
    paddingHorizontal: 20,
  },
  secretsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  secretsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  secretItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  secretContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  secretText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  secretMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  safeBadge: {
    backgroundColor: '#E6EBFF',
  },
  revealedBadge: {
    backgroundColor: '#FFE5E5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  safeText: {
    color: '#4A6FFF',
  },
  revealedText: {
    color: '#E86D6D',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    padding: 4,
  },
});

export default PatientManageSecrets; 