import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { createInvitation } from '../lib/invitations';
import { supabase } from '../../lib/supabase';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import DoctorBottomNav from '../components/DoctorBottomNav';
import { createGroup } from '../lib/groups';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorPatientInvitation'>;

const DoctorPatientInvitation = () => {
  const navigation = useNavigation<NavigationProp>();
  const [invitationCode, setInvitationCode] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'Email' | 'SMS'>('Email');

  const handleGenerateNewCode = async () => {
    setIsGenerating(true);
    try {
      const session = supabase.auth.session();
      if (!session?.user) {
        Alert.alert('Error', 'You must be logged in to generate invitation code');
        return;
      }
      // Create a group for this patient invitation
      const { id: groupId } = await createGroup({ doctorId: session.user.id });
      // Create invitation with groupId
      const { code, id } = await createInvitation({
        inviterId: session.user.id,
        inviteeEmail: patientEmail || undefined,
        role: 'patient',
        groupId,
      });
      setInvitationCode(code);
      setMessage(`Hi, I'm inviting you to join Secret Reveal. Use this code: ${code} to register as my patient.`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to generate invitation code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (message) {
      await Clipboard.setStringAsync(message);
      Alert.alert('Success', 'Message copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (message) {
      try {
        await Linking.openURL(`mailto:${patientEmail}?subject=Secret Reveal Invitation&body=${encodeURIComponent(message)}`);
      } catch (error) {
        Alert.alert('Error', 'Could not open email client');
      }
    }
  };

  const handleUseTemplate = () => {
    if (!invitationCode) {
      Alert.alert('Error', 'Please generate an invitation code first');
      return;
    }
    setMessage(`Hi, I'm inviting you to join Secret Reveal. Use this code: ${invitationCode} to register as my patient.`);
  };

  const handleSendInvitation = async () => {
    try {
      const session = supabase.auth.session();
      if (!session?.user) {
        Alert.alert('Error', 'You must be logged in to send invitations');
        return;
      }

      // Rest of the invitation logic
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send invitation');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invite Patient</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Patient Invitation</Text>
          <Text style={styles.subtitle}>
            Share a unique code with your patient to join Secret Reveal. This code will automatically
            identify them as your patient.
          </Text>

          <View style={styles.codeSection}>
            <View style={styles.codeHeader}>
              <View style={styles.codeIcon}>
                <Ionicons name="key" size={24} color="#4A6FFF" />
              </View>
              <View>
                <Text style={styles.codeTitle}>Invitation Code</Text>
                <Text style={styles.codeValidity}>Valid for 7 days</Text>
              </View>
            </View>

            <View style={styles.codeContainer}>
              <Text style={styles.code}>{invitationCode || 'No code generated yet'}</Text>
              <TouchableOpacity onPress={handleCopyToClipboard} disabled={!message}>
                <Ionicons name="copy-outline" size={24} color={message ? "#4A6FFF" : "#CCCCCC"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              onPress={handleGenerateNewCode}
              disabled={isGenerating}
            >
              <Text style={[styles.generateButtonText, isGenerating && styles.generateButtonTextDisabled]}>
                {isGenerating ? 'Generating...' : 'Generate New Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.shareSection}>
            <Text style={styles.shareTitle}>Share Invitation</Text>
            <View style={styles.tabs}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'Email' && styles.activeTab]}
                onPress={() => setActiveTab('Email')}
              >
                <Text style={[styles.tabText, activeTab === 'Email' && styles.activeTabText]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'SMS' && styles.activeTab]}
                onPress={() => setActiveTab('SMS')}
              >
                <Text style={[styles.tabText, activeTab === 'SMS' && styles.activeTabText]}>
                  SMS
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Patient Email</Text>
              <TextInput
                style={styles.input}
                placeholder="patient@example.com"
                value={patientEmail}
                onChangeText={setPatientEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.messageContainer}>
                <Text style={styles.label}>Message</Text>
                <TouchableOpacity onPress={handleUseTemplate} disabled={!invitationCode}>
                  <Text style={[styles.templateLink, !invitationCode && styles.templateLinkDisabled]}>
                    Use Template
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.messageInput]}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                placeholder="Enter your message here..."
              />

              <TouchableOpacity 
                style={[styles.sendButton, (!invitationCode || !patientEmail) && styles.sendButtonDisabled]}
                onPress={handleShare}
                disabled={!invitationCode || !patientEmail}
              >
                <Ionicons name="mail" size={20} color="white" />
                <Text style={styles.sendButtonText}>Send Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#4A6FFF" />
            <Text style={styles.infoText}>
              When your patient uses this code, they'll be automatically identified as
              your patient and will be able to receive your assigned tasks.
            </Text>
          </View>
        </View>
      </ScrollView>

      <DoctorBottomNav activeTab="Patients" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4A6FFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 24,
  },
  codeSection: {
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E6EBFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  codeValidity: {
    fontSize: 14,
    color: '#666666',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  code: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  generateButton: {
    backgroundColor: '#E6EBFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  generateButtonText: {
    color: '#4A6FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButtonTextDisabled: {
    color: '#999999',
  },
  shareSection: {
    marginBottom: 24,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A6FFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    color: '#4A6FFF',
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateLink: {
    color: '#4A6FFF',
    fontSize: 14,
  },
  templateLinkDisabled: {
    color: '#CCCCCC',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#4A6FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default DoctorPatientInvitation; 