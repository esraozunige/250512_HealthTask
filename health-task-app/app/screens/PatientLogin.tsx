import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import CheckBox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// @ts-ignore
import { supabase } from '../../lib/supabase';
// @ts-ignore
import { RootStackParamList } from '../../App';

export default function PatientLogin() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Sign in with Supabase Auth
      const { session, error } = await supabase.auth.signIn({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!session?.user) {
        setError('No user found');
        setLoading(false);
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
            role: 'patient',
            full_name: user.user_metadata?.fullName || '',
            profile_photo: '',
            current_streak: 0,
            longest_streak: 0,
          },
        ]);

        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return;
        }

        // Fetch again
        const { data: newProfile, error: newFetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (newFetchError || !newProfile) {
          setError(newFetchError?.message || 'Could not fetch user profile');
          setLoading(false);
          return;
        }
        userProfile = newProfile;
      } else if (fetchError || !userProfile) {
        setError(fetchError?.message || 'Could not fetch user profile');
        setLoading(false);
        return;
      }

      // 3. Verify user role
      if (userProfile.role !== 'patient') {
        setError('This account is not authorized as a patient');
        setLoading(false);
        return;
      }

      // 4. Check onboarding progress
      // 4.1. Check if patient is in a group
      const { data: groupMember, error: groupMemberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)
        .eq('role', 'patient')
        .single();
      if (groupMemberError || !groupMember) {
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'PatientInvitePlayers', params: { group_id: null } }],
        });
        return;
      }
      const group_id = groupMember.group_id;
      // 4.2. Check invited players
      const { count: invitedCount, error: invitedError } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group_id)
        .eq('role', 'player');
      if (invitedError || !invitedCount || invitedCount < 1) {
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'PatientInvitePlayers', params: { group_id } }],
        });
        return;
      }
      // 4.3. Check secrets
      const { count: secretCount, error: secretError } = await supabase
        .from('secrets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (secretError || !secretCount || secretCount < 2) {
        setLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'PatientAddSecrets', params: { group_id } }],
        });
        return;
      }
      setLoading(false);
      // 5. Navigate to PatientDashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'PatientDashboard' }],
      });
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoSection}>
          <Ionicons name="heart-outline" size={48} color="#E15B64" style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text style={styles.title}>HealthTogether</Text>
          <Text style={styles.subtitle}>Your journey to better health</Text>
        </View>
        <Text style={styles.sectionTitle}>Patient Login</Text>
        <Text style={styles.sectionSubtitle}>Sign in to continue your health journey</Text>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputRow}>
          <Ionicons name="at-outline" size={20} color="#B0B0B0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="#B0B0B0"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Email"
          />
        </View>
        <View style={styles.passwordLabelRow}>
          <Text style={styles.label}>Password</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PatientChangePassword')}>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={20} color="#B0B0B0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#B0B0B0"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="Password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#B0B0B0" />
          </TouchableOpacity>
        </View>
        <View style={styles.rememberRow}>
          <CheckBox
            value={rememberMe}
            onValueChange={setRememberMe}
            style={styles.checkbox}
            color={rememberMe ? '#E15B64' : '#B0B0B0'}
          />
          <Text style={styles.rememberText}>Remember me</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.signInText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>
        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={20} color="#4285F4" style={{ marginRight: 8 }} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>
        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Have an invitation code? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PatientInvitationCode')}>
            <Text style={styles.link}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'stretch',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E15B64',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    color: '#222',
    marginBottom: 4,
    marginTop: 8,
    fontWeight: '500',
  },
  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#222',
  },
  forgot: {
    color: '#E15B64',
    fontSize: 13,
    marginLeft: 8,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 8,
  },
  rememberText: {
    fontSize: 15,
    color: '#222',
  },
  signInButton: {
    backgroundColor: '#E15B64',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  signInText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 8,
    color: '#888',
    fontSize: 15,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
  },
  socialText: {
    fontSize: 16,
    color: '#222',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  bottomText: {
    color: '#888',
    fontSize: 15,
  },
  link: {
    color: '#E15B64',
    fontWeight: 'bold',
    fontSize: 15,
  },
  error: {
    color: '#E15B64',
    textAlign: 'center',
    marginBottom: 8,
  },
}); 