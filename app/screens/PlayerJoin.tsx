import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import { verifyInvitation } from '../lib/invitations';

const MOCK_GROUP = {
  owner: {
    name: 'Deen Rufus',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  groupName: "Deen Rufus's Health Group",
  description: 'Help Deen stay on track with health goals',
  details: `As a supporter, you\'ll help keep Deen accountable. If Deen misses health tasks, their secrets will be revealed to the group.`,
  members: 3,
};

type GroupInfo = typeof MOCK_GROUP;

const PlayerJoin = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PlayerJoin'>>();
  const [code, setCode] = useState('');
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Please enter a code.');
      return;
    }
    try {
      // 1. Check invitation
      const invitation = await verifyInvitation(code.trim(), 'player');
      // 2. Fetch group info
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, doctor_id, patient_id')
        .eq('id', invitation.groupId)
        .single();
      if (groupError || !group) {
        setGroupInfo(null);
        setError('Group not found.');
        return;
      }
      // 3. Insert into group_members
      const session = supabase.auth.session();
      if (!session?.user) {
        setGroupInfo(null);
        setError('User not authenticated.');
        return;
      }
      const { error: memberError } = await supabase.from('group_members').insert([
        {
          group_id: group.id,
          user_id: session.user.id,
          role: 'player',
        },
      ]);
      if (memberError) {
        setGroupInfo(null);
        setError('Could not join group.');
        return;
      }
      // 4. Update invitation status
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id);
      // 5. Pass info to next screen
      setError('');
      navigation.navigate('PlayerCreateAccount', {
        groupInfo: {
          owner: { name: '', avatar: '' }, // Optionally fetch owner info
          groupName: '', // Optionally fetch group name
          description: '', // Optionally fetch group description
        },
        group_id: group.id,
      });
    } catch (error) {
      setGroupInfo(null);
      setError(error instanceof Error ? error.message : 'Invalid or expired invitation code.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#6B5ECD" />
        </TouchableOpacity>
        <Text style={styles.header}>Join Health Group</Text>
        <Text style={styles.subHeader}>Player Invitation Code</Text>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={40} color="#B39DFF" />
          </View>
          <Text style={styles.invitedTitle}>You've Been Invited!</Text>
          <Text style={styles.invitedText}>
            Enter the invitation code shared with you to join your friend\'s health accountability group.
          </Text>
          {groupInfo && (
            <View style={styles.groupBox}>
              <View style={styles.groupHeader}>
                <Image source={{ uri: groupInfo.owner.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupName}>{groupInfo.groupName}</Text>
                  <Text style={styles.groupDesc}>{groupInfo.description}</Text>
                </View>
              </View>
              <Text style={styles.groupDetails}>{groupInfo.details}</Text>
              <View style={styles.groupMembersRow}>
                <Ionicons name="people" size={18} color="#6B5ECD" />
                <Text style={styles.groupMembers}>{groupInfo.members} members in this group</Text>
              </View>
            </View>
          )}
          <Text style={styles.inputLabel}>Enter your invitation code</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="ABCD-1234"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="default"
              maxLength={9}
            />
            <TouchableOpacity style={styles.inputButton} onPress={handleVerify}>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.joinButton} onPress={handleVerify}>
            <Text style={styles.joinButtonText}>Join Group</Text>
          </TouchableOpacity>
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
    backgroundColor: '#F5F6FA',
    paddingTop: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6B5ECD',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    width: '92%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  invitedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  invitedText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 18,
    textAlign: 'center',
  },
  groupBox: {
    backgroundColor: '#F5F6FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    width: '100%',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#EEE',
  },
  groupName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  groupDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  groupDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  groupMembersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupMembers: {
    fontSize: 13,
    color: '#6B5ECD',
    marginLeft: 4,
  },
  inputLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8FF',
    marginRight: 8,
  },
  inputButton: {
    backgroundColor: '#6B5ECD',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E86D6D',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: '#6B5ECD',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlayerJoin; 