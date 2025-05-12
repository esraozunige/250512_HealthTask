import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
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

const DoctorLogin = () => {
  const navigation = useNavigation<NavigationProp>();
  const { setDoctor } = useDoctor();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign in with Supabase Auth
      const { session, error: signInError } = await supabase.auth.signIn({
        email,
        password,
      });

      if (signInError) {
        setLoading(false);
        Alert.alert('Error', signInError.message);
        return;
      }

      if (!session?.user) {
        setLoading(false);
        Alert.alert('Error', 'Could not get user ID from Supabase');
        return;
      }
      const user = session.user;
      // 2. Fetch user profile from users table
      let { data: userProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // No user found, insert new user
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: user.id,
            email: user.email,
            role: 'doctor',
            full_name: user.user_metadata?.fullName || '',
            profile_photo: '',
            current_streak: 0,
            longest_streak: 0,
          },
        ]);
        if (insertError) {
          setLoading(false);
          Alert.alert('Error', insertError.message);
          return;
        }
        // Fetch again
        const { data: newProfile, error: newFetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        if (newFetchError || !newProfile) {
          setLoading(false);
          Alert.alert('Error', newFetchError?.message || 'Could not fetch user profile');
          return;
        }
        userProfile = newProfile;
      } else if (fetchError || !userProfile) {
        setLoading(false);
        Alert.alert('Error', fetchError?.message || 'Could not fetch user profile');
        return;
      }

      // 3. Verify user role
      if (userProfile.role !== 'doctor') {
        setLoading(false);
        Alert.alert('Error', 'This account is not authorized as a doctor');
        return;
      }

      // 4. Update DoctorContext
      await setDoctor({
        fullName: userProfile.full_name,
        specialty: userProfile.specialization || '',
        hospital: userProfile.hospital || '',
        aboutMe: userProfile.about_me || '',
        profilePhotoUrl: userProfile.profile_photo || '',
        email: userProfile.email,
      });

      setLoading(false);

      // 5. Navigate to DoctorPatients
      navigation.reset({
        index: 0,
        routes: [{ name: 'DoctorPatients' }],
      });
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate('CreateDoctorAccount');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      const { error } = await supabase.auth.api.resetPasswordForEmail(email);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="checkmark" size={40} color="white" />
          </View>
          <Text style={styles.appName}>Secret Reveal</Text>
          <Text style={styles.portalText}>Doctor Portal</Text>
        </View>

        <Text style={styles.welcomeText}>Welcome Back</Text>

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
          <View style={styles.passwordHeader}>
            <Text style={styles.inputLabel}>Password</Text>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
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

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setKeepSignedIn(!keepSignedIn)}
        >
          <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
            {keepSignedIn && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text style={styles.checkboxLabel}>Keep me signed in</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signInButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.createAccountContainer}>
          <Text style={styles.noAccountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleCreateAccount}>
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By signing in, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#4A6FFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4A6FFF',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A6FFF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  signInButton: {
    backgroundColor: '#4A6FFF',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noAccountText: {
    fontSize: 14,
    color: '#666666',
  },
  createAccountText: {
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

export default DoctorLogin; 