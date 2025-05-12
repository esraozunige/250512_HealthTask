import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerCreateAccount'>;
type RouteProp = ReturnType<typeof useRoute>;

const PlayerCreateAccount = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const { groupInfo } = route.params;

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleContinue = async () => {
    if (!form.fullName || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    // 1. Register with Supabase Auth
    const { user, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (signUpError) {
      Alert.alert('Error', signUpError.message);
      return;
    }
    if (!user) {
      Alert.alert('Success', 'Check your email to confirm your account.');
      navigation.navigate('PlayerJoin');
      return;
    }
    // If user is returned (rare), insert into users table
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: user.id,
        email: form.email,
        role: 'player',
        full_name: form.fullName,
        profile_photo: '',
        current_streak: 0,
        longest_streak: 0,
      },
    ]);
    if (insertError) {
      Alert.alert('Error', insertError.message);
      return;
    }
    Alert.alert('Success', 'Account created. You can now log in.');
    navigation.navigate('PlayerAddSecret', { group_id: route.params.group_id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color="#6B5ECD" />
            </TouchableOpacity>
            <Text style={styles.header}>Create Your Account</Text>
            <Text style={styles.stepText}>• Step 1 of 2</Text>
            <View style={styles.card}>
              <View style={styles.groupBox}>
                <Image source={{ uri: groupInfo.owner.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupTitle}>Joining {groupInfo.owner.name}'s Group</Text>
                  <Text style={styles.groupDesc}>{groupInfo.description}</Text>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  value={form.fullName}
                  onChangeText={text => handleChange('fullName', text)}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  value={form.email}
                  onChangeText={text => handleChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  value={form.password}
                  onChangeText={text => handleChange('password', text)}
                  secureTextEntry
                />
                <Text style={styles.hint}>Must be at least 8 characters</Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder=""
                  value={form.phone}
                  onChangeText={text => handleChange('phone', text)}
                  keyboardType="phone-pad"
                />
              </View>
              <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
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
    alignSelf: 'flex-start',
    marginLeft: 24,
  },
  stepText: {
    fontSize: 15,
    color: '#6B5ECD',
    fontWeight: '500',
    marginBottom: 16,
    alignSelf: 'flex-start',
    marginLeft: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 28,
    padding: 24,
    width: '92%',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  groupBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#EEE',
  },
  groupTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  groupDesc: {
    fontSize: 13,
    color: '#666',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8FF',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginLeft: 2,
  },
  continueButton: {
    backgroundColor: '#6B5ECD',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default PlayerCreateAccount; 