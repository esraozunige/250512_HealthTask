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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientInvitationCode'>;

const PatientInvitationCode = () => {
  const navigation = useNavigation<NavigationProp>();
  const [code, setCode] = useState(['', '', '', '', '', '', '']);
  const [doctorInfo, setDoctorInfo] = useState<{
    name: string;
    specialization: string;
    message: string;
  } | null>(null);

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
    const enteredCode = code.join('');
    if (!enteredCode || enteredCode.length !== 7) {
      Alert.alert('Error', 'Please enter a valid invitation code.');
      return;
    }

    // Validate code format
    const codeRegex = /^[DP][A-Z0-9]{6}$/;
    if (!codeRegex.test(enteredCode)) {
      Alert.alert('Error', 'Invalid invitation code format.');
      return;
    }

    try {
      // 1. Check invitation
      const invitation = await verifyInvitation(enteredCode, 'patient');
      // 2. Fetch doctor info from inviter_id and ensure role is 'doctor'
      const { data: doctor, error: doctorError } = await supabase
        .from('users')
        .select('id, full_name, specialization, email, role')
        .eq('id', invitation.inviter_id)
        .single();
      if (doctorError || !doctor || doctor.role !== 'doctor') {
        Alert.alert('Error', 'Doctor not found or not valid.');
        return;
      }

      // 3. Add patient to the group
      const { error: groupError } = await supabase
        .from('group_members')
        .insert({
          group_id: invitation.groupId,
          user_id: supabase.auth.user()?.id,
          role: 'patient'
        });
      if (groupError) {
        console.error('Failed to add to group:', groupError);
        Alert.alert('Error', 'Failed to add to group.');
        return;
      }

      // 4. Pass info to next screen
      setDoctorInfo({
        name: doctor.full_name,
        specialization: doctor.specialization || '',
        message: 'Your doctor has invited you to join Secret Reveal to help improve your health habits through accountability.',
      });
      navigation.navigate('PatientRegistration', {
        doctorInfo: {
          name: doctor.full_name,
          specialization: doctor.specialization || '',
          invitationCode: enteredCode,
        },
      });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Invalid or expired invitation code.');
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