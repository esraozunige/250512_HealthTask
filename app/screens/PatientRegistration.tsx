import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientRegistration'>;
type PatientRegistrationRouteProp = RouteProp<RootStackParamList, 'PatientRegistration'>;

const PatientRegistration = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PatientRegistrationRouteProp>();
  const { doctorInfo, group_id } = route.params;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleCreateAccount = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    // 1. Register with Supabase Auth
    const { user, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    if (signUpError) {
      Alert.alert('Error', signUpError.message);
      return;
    }
    if (!user) {
      Alert.alert('Success', 'Check your email to confirm your account before continuing.');
      return;
    }
    // 2. Insert into users table
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: user.id,
        email: formData.email,
        role: 'patient',
        full_name: formData.fullName,
        profile_photo: '',
        current_streak: 0,
        longest_streak: 0,
      },
    ]);
    if (insertError && !insertError.message.includes('duplicate key')) {
      Alert.alert('Error', insertError.message);
      return;
    }
    // 3. Add patient to group as member
    let finalGroupId = group_id;
    if (!finalGroupId) {
      // Fallback: create a group if not present (should not happen if flow is correct)
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          patient_id: user.id,
          doctor_id: null,
        })
        .select()
        .single();
      if (groupError) {
        Alert.alert('Error', 'Could not create group.');
        return;
      }
      finalGroupId = group.id;
    } else {
      // Update group with patient_id if not set
      await supabase
        .from('groups')
        .update({ patient_id: user.id })
        .eq('id', finalGroupId);
    }

    // Insert patient as group member
    await supabase.from('group_members').insert([
      {
        group_id: finalGroupId,
        user_id: user.id,
        role: 'patient',
      },
    ]);

    // Optionally, update invitation status to 'accepted' here

    // 4. Navigate to PatientInvitePlayers, passing group_id
    navigation.navigate('PatientInvitePlayers', { group_id: finalGroupId || '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
            <Text style={styles.stepText}>Step 2 of 4</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>

          <View style={styles.mainContent}>
            <Text style={styles.description}>
              Join Secret Reveal to start your health journey with a twist of accountability.
            </Text>

            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#E86D6D" />
              </View>
              <TouchableOpacity style={styles.addPhotoButton}>
                <Ionicons name="camera" size={20} color="#E86D6D" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  secureTextEntry
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                />
              </View>
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={24} color="#666" />
              <Text style={styles.infoText}>
                Your doctor has invited you to join Secret Reveal. After registration, you'll need to:
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={styles.bulletPoint}>• Invite at least 1 player to join your group</Text>
                <Text style={styles.bulletPoint}>• Add at least 2 personal secrets</Text>
                <Text style={styles.bulletPoint}>• Create your own health tasks</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              <View style={styles.checkbox}>
                {agreeToTerms && <Ionicons name="checkmark" size={16} color="#E86D6D" />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createButton, !agreeToTerms && styles.createButtonDisabled]}
              onPress={handleCreateAccount}
              disabled={!agreeToTerms}
            >
              <Text style={styles.createButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E86D6D',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  bulletPoints: {
    marginTop: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#E86D6D',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  termsLink: {
    color: '#E86D6D',
    textDecorationLine: 'underline',
  },
  createButton: {
    backgroundColor: '#E86D6D',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#DDD',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PatientRegistration; 