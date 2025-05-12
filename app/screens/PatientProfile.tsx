import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import PatientBottomNav from '../components/PatientBottomNav';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientProfile'>;

const PatientProfile = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = supabase.auth.user();
        if (!user) {
          setError('No user found');
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) {
          setError('Failed to fetch profile');
          setLoading(false);
          return;
        }
        setProfile(data);
      } catch (e) {
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uploading]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      await uploadProfilePhoto(asset.uri);
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    try {
      setUploading(true);
      const user = supabase.auth.user();
      if (!user) throw new Error('No user found');
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicURL = publicUrlData?.publicURL || '';
      // Update user profile with photo URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_photo: publicURL })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setProfile((prev: any) => ({ ...prev, profile_photo: publicURL }));
    } catch (e) {
      alert('Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const renderInfoItem = (label: string, value: string) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const renderStatItem = (label: string, value: string | number) => (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{error || 'Profile not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity 
          style={styles.headerEditButton}
          onPress={() => navigation.navigate({ name: 'PatientEditProfile', params: undefined })}
        >
          <Ionicons name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profile.profile_photo ? (
              <Image source={{ uri: profile.profile_photo }} style={styles.profileImage} />
            ) : (
            <View style={styles.profileImage}>
              <Ionicons name="person-circle-outline" size={120} color="#ccc" />
            </View>
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage} disabled={uploading}>
              <Ionicons name="camera" size={20} color="#E86D6D" />
            </TouchableOpacity>
            {uploading && <Text style={{ color: '#E86D6D', marginTop: 4 }}>Uploading...</Text>}
          </View>

          <Text style={styles.userName}>{profile.full_name || ''}</Text>
          <Text style={styles.userEmail}>{profile.email || ''}</Text>

          <View style={styles.streakContainer}>
            <Ionicons name="moon" size={16} color="#666" />
            <Text style={styles.streakText}>
              {profile.current_streak != null && profile.current_streak !== undefined ? `${profile.current_streak} day streak` : '-'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          {renderInfoItem('Full Name', profile.full_name || '')}
          {renderInfoItem('Email', profile.email || '')}
          {renderInfoItem('Phone', profile.phone || '')}
          {renderInfoItem('Member Since', profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Stats</Text>
          {renderStatItem('Current Streak', profile.current_streak != null && profile.current_streak !== undefined ? `${profile.current_streak} days` : '-')}
          {renderStatItem('Longest Streak', profile.longest_streak != null && profile.longest_streak !== undefined ? `${profile.longest_streak} days` : '-')}
          {renderStatItem('Tasks Completed', profile.tasks_completed != null && profile.tasks_completed !== undefined ? profile.tasks_completed : '-')}
        </View>
      </ScrollView>

      <PatientBottomNav activeTab="Settings" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#E86D6D',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  headerEditButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E86D6D',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E86D6D',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  statValue: {
    fontSize: 16,
    color: '#4A6FFF',
    fontWeight: '600',
  },
});

export default PatientProfile; 