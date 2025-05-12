import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import { useDoctor } from '../context/DoctorContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreateDoctorAccount = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setDoctor } = useDoctor();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!fullName || !email || !password || !specialization) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      // 1. Register with Supabase Auth
      const { user, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setLoading(false);
        Alert.alert('Error', signUpError.message);
        return;
      }
      if (!user) {
        setLoading(false);
        Alert.alert('Success', 'Check your email to confirm your account.');
        navigation.navigate('DoctorLogin');
        return;
      }
      // 2. Insert into users table
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: user.id,
          email,
          full_name: fullName,
          specialization,
          role: 'doctor',
        }
      ]);
      if (insertError) {
        setLoading(false);
        Alert.alert('Error', insertError.message);
        return;
      }
      setLoading(false);
      Alert.alert('Success', 'Account created. You can now log in.');
      navigation.navigate('DoctorLogin');
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('DoctorLogin')}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="checkmark" size={40} color="white" />
            </View>
            <Text style={styles.appName}>Secret Reveal</Text>
            <Text style={styles.portalText}>Doctor Portal</Text>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Please fill in the details below</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Dr. John Doe"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="doctor@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Specialization</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="medical-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Cardiologist"
                value={specialization}
                onChangeText={setSpecialization}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorLogin')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    padding: 16,
  },
  content: {
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4A6FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  portalText: {
    fontSize: 16,
    color: '#666666',
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
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1A1A1A',
  },
  createButton: {
    backgroundColor: '#4A6FFF',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: 14,
    color: '#4A6FFF',
    fontWeight: '600',
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  termsLink: {
    color: '#4A6FFF',
  },
});

export default CreateDoctorAccount; 