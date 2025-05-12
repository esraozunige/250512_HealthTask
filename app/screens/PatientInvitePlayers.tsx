import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import { createInvitation, insertPendingPlayerUser } from '../lib/invitations';
import * as Clipboard from 'expo-clipboard';
import { Alert as RNAlert } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientInvitePlayers'>;
type PatientInvitePlayersRouteProp = RouteProp<RootStackParamList, 'PatientInvitePlayers'>;

interface InvitedPlayer {
  id: string;
  email: string;
  code: string;
}

const PatientInvitePlayers = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PatientInvitePlayersRouteProp>();
  const { group_id } = route.params;
  const [email, setEmail] = useState('');
  const [invitedPlayers, setInvitedPlayers] = useState<InvitedPlayer[]>([]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddPlayer = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Please enter an email address');
      return;
    }

    if (!isValidEmail(email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    if (invitedPlayers.some(player => player.email === email)) {
      showAlert('Error', 'This email has already been invited');
      return;
    }

    console.log('Adding player with email:', email);
    console.log('Current invited players:', invitedPlayers);

    // Get current session
    const session = supabase.auth.session();
    console.log('Session:', session);
    if (!session?.user) {
      showAlert('Error', 'User not authenticated. Please sign in again.');
      return;
    }

    if (!group_id) {
      showAlert('Error', 'Group not found.');
      return;
    }

    try {
      const invitation = await createInvitation({
        inviterId: session.user.id,
        inviteeEmail: email.trim(),
        role: 'player',
        groupId: group_id,
      });
      console.log('Invitation created:', invitation);
      await insertPendingPlayerUser(email.trim());
      const newPlayer: InvitedPlayer = {
        id: Math.random().toString(),
        email: email.trim(),
        code: invitation.code,
      };
      setInvitedPlayers([...invitedPlayers, newPlayer]);
      console.log('Player added:', newPlayer);
      setEmail('');
    } catch (error) {
      console.error('Error creating invitation:', error);
      showAlert('Error', 'Could not create invitation.');
    }
  };

  const handleRemovePlayer = (id: string) => {
    setInvitedPlayers(invitedPlayers.filter(player => player.id !== id));
  };

  const handleContinue = () => {
    if (invitedPlayers.length >= 1) {
        navigation.navigate('PatientAddSecrets', { group_id });
    }
  };

  const handleSkip = () => {
    navigation.navigate('PatientAddSecrets', { group_id });
  };

  const handleSendEmail = (player: InvitedPlayer) => {
    if (!player.email || !player.code) return;
    const subject = encodeURIComponent('You are invited to join Secret Reveal!');
    const body = encodeURIComponent(
      `Hi!\n\nYou have been invited to join a Secret Reveal health accountability group.\n\nYour invitation code: ${player.code}\n\nDownload the app and use this code to join as a player.\n\nSee you inside!`
    );
    const mailto = `mailto:${player.email}?subject=${subject}&body=${body}`;
    Linking.openURL(mailto);
  };

  const handleCopyCode = async (code: string) => {
    if (Platform.OS === 'web') {
      try {
        await window.navigator.clipboard.writeText(code);
        window.alert('Invitation code copied to clipboard');
      } catch (e) {
        window.alert('Failed to copy code');
      }
    } else {
      await Clipboard.setStringAsync(code);
      RNAlert.alert('Copied', 'Invitation code copied to clipboard');
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      RNAlert.alert(title, message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.stepText}>Step 3 of 4</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Invite Players</Text>

        <View style={styles.mainContent}>
          <Text style={styles.heading}>Build Your Accountability Circle</Text>
          <Text style={styles.description}>
            Invite at least 1 friend to join your health accountability group. They'll add their own secrets and tasks too!
          </Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#666" />
            <Text style={styles.infoText}>Your friends will need to:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Add their own secrets (minimum 5)</Text>
              <Text style={styles.bulletPoint}>• Create their own health tasks</Text>
              <Text style={styles.bulletPoint}>• Support you on your health journey</Text>
            </View>
          </View>

          <View style={styles.inviteSection}>
            <Text style={styles.sectionTitle}>Invite by Email</Text>
            <View style={styles.emailInputContainer}>
              <TextInput
                style={styles.emailInput}
                placeholder="friend@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddPlayer}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.invitedSection}>
            <Text style={styles.sectionTitle}>Invited Players ({invitedPlayers.length}/1)</Text>
            {invitedPlayers.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Ionicons name="people" size={32} color="#666" />
                </View>
                <Text style={styles.emptyStateText}>
                  No players invited yet. Invite at least 1 friend to continue.
                </Text>
              </View>
            ) : (
              <View style={styles.playersList}>
                {invitedPlayers.map(player => (
                  <View key={player.id} style={styles.playerItem}>
                    <View style={styles.playerInfo}>
                      <View style={styles.playerAvatar}>
                        <Ionicons name="person" size={20} color="#E86D6D" />
                      </View>
                      <View>
                      <Text style={styles.playerEmail}>{player.email}</Text>
                        {player.code && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.invitationCode}>Invitation Code: {player.code}</Text>
                            <TouchableOpacity onPress={() => handleCopyCode(player.code)}>
                              <Ionicons name="copy-outline" size={18} color="#4A6FFF" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleSendEmail(player)}
                        style={styles.sendEmailButton}
                      >
                        <Ionicons name="mail-outline" size={20} color="#4A6FFF" />
                      </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleRemovePlayer(player.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            invitedPlayers.length < 1 && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={invitedPlayers.length < 1}
        >
          <Text style={styles.continueButtonText}>
            Continue ({invitedPlayers.length}/1 Invited)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now (not recommended)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E86D6D',
  },
  content: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  stepText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  mainContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  inviteSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emailInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#E86D6D',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invitedSection: {
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  emptyStateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  playersList: {
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerEmail: {
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
  },
  continueButton: {
    backgroundColor: '#E86D6D',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonDisabled: {
    backgroundColor: '#DDD',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  invitationCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sendEmailButton: {
    padding: 4,
  },
});

export default PatientInvitePlayers; 