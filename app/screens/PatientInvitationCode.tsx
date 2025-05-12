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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import { verifyInvitation } from '../lib/invitations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientInvitationCode'>;

const PatientInvitationCode = () => {
  const navigation = useNavigation<NavigationProp>();
  const [code, setCode] = useState(['', '', '', '', '', '', '']);
  const [doctorInfo, setDoctorInfo] = useState<{
    name: string;
    specialization: string;
    message: string;
  } | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [groupId, setGroupId] = useState('');

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.toUpperCase();
    setCode(newCode);

    // Move to next input if current input is filled
    if (text.length === 1 && index < 6) {
      // Focus next input
    }

    // Check if code is complete
    if (newCode.every(digit => digit !== '') && newCode.join('') === '123456') {
      setDoctorInfo({
        name: 'Dr. Johnson',
        specialization: 'Obesity Medicine Specialist',
        message: 'Your doctor has invited you to join Secret Reveal to help improve your health habits through accountability.',
      });
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError('');
    try {
      const inputCode = code.join('').trim();
      setEnteredCode(inputCode);
      if (!inputCode) {
        setError('Please enter the invitation code.');
        setLoading(false);
        return;
      }
      // Verify invitation code
      const invitation = await verifyInvitation(inputCode, 'patient');
      if (!invitation || !invitation.inviter_id) {
        setError('Invalid or expired invitation code.');
        setLoading(false);
        return;
      }
      // Fetch doctor profile
      const { data: doctor, error: doctorError } = await supabase
        .from('users')
        .select('full_name, specialization, email, profile_photo')
        .eq('id', invitation.inviter_id)
        .single();
      if (doctorError || !doctor) {
        setError('Doctor profile not found.');
        setLoading(false);
        return;
      }
      setDoctorProfile(doctor);
      setShowDoctorModal(true);
      setLoading(false);
      setGroupId(invitation.groupId || '');
    } catch (err) {
      setError('Failed to verify code.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.stepText}>Step 1 of 4</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Doctor Invitation</Text>

        <View style={styles.mainContent}>
          <Text style={styles.heading}>Enter Your Invitation Code</Text>
          <Text style={styles.description}>
            Please enter the invitation code provided by your doctor to continue with your health plan.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Ionicons name="add" size={24} color="#E86D6D" />
            </View>
            <Text style={styles.infoText}>Doctor-Guided Registration</Text>
            <Text style={styles.infoDescription}>
              Your doctor will be able to assign health tasks tailored to your needs and monitor your progress.
            </Text>
          </View>

          <Text style={styles.label}>Invitation Code</Text>
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                style={styles.codeInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                autoCapitalize="characters"
                maxLength={1}
              />
            ))}
          </View>

          {doctorInfo && (
            <View style={styles.doctorCard}>
              <Image
                source={require('../../assets/doctor-avatar.png')}
                style={styles.doctorImage}
              />
              <Text style={styles.doctorName}>{doctorInfo.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctorInfo.specialization}</Text>
              <Text style={styles.doctorMessage}>{doctorInfo.message}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.verifyButton,
              code.every(digit => digit !== '') && styles.verifyButtonActive
            ]}
            disabled={!code.every(digit => digit !== '')}
            onPress={handleVerifyCode}
          >
            <Text style={styles.verifyButtonText}>Verify Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Landing')}
          >
            <Text style={styles.noCodeText}>I don't have a code</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showDoctorModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDoctorModal(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', width: 320 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Doctor Profile</Text>
            {doctorProfile?.profile_photo ? (
              <Image source={{ uri: doctorProfile.profile_photo }} style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 12 }} />
            ) : (
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E6EBFF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="person" size={32} color="#B0B0B0" />
              </View>
            )}
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>{doctorProfile?.full_name}</Text>
            <Text style={{ color: '#888', marginBottom: 4 }}>{doctorProfile?.specialization}</Text>
            <Text style={{ color: '#888', marginBottom: 12 }}>{doctorProfile?.email}</Text>
            <TouchableOpacity
              style={{ backgroundColor: '#E86D6D', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 32, marginTop: 8 }}
              onPress={() => {
                setShowDoctorModal(false);
                navigation.navigate('PatientRegistration', {
                  doctorInfo: {
                    name: doctorProfile.full_name,
                    specialization: doctorProfile.specialization,
                    invitationCode: enteredCode,
                  },
                  group_id: groupId,
                });
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 30,
  },
  mainContent: {
    backgroundColor: 'white',
    borderRadius: 20,
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
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
  },
  doctorCard: {
    backgroundColor: '#F8F0FF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  doctorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#DDD',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  verifyButtonActive: {
    backgroundColor: '#E86D6D',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noCodeText: {
    color: '#666',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default PatientInvitationCode; 