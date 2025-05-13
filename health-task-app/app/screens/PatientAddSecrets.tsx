import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import { screenSecretWithGemini } from '../lib/gemini';
import { addSecret } from '../lib/secrets';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientAddSecrets'>;
type PatientAddSecretsRouteProp = RouteProp<RootStackParamList, 'PatientAddSecrets'>;

interface Secret {
  id: string;
  content: string;
}

const PatientAddSecrets = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PatientAddSecretsRouteProp>();
  const { group_id } = route.params;
  const [currentSecret, setCurrentSecret] = useState('');
  const [secrets, setSecrets] = useState<string[]>([]);
  const requiredSecrets = 2;
  const remainingSecrets = requiredSecrets - secrets.length;
  const [isScreening, setIsScreening] = useState(false);

  const handleAddSecret = async () => {
    if (!currentSecret.trim()) {
      Alert.alert('Error', 'Please enter a secret');
      return;
    }
    if (secrets.includes(currentSecret.trim())) {
      Alert.alert('Error', 'You have already added this secret');
      return;
    }
    setIsScreening(true);
    try {
      const isValid = await screenSecretWithGemini(currentSecret.trim());
      if (!isValid) {
        Alert.alert('Not a valid secret', 'Please enter a more private, sensitive, and meaningful secret.');
        setIsScreening(false);
        return;
      }
      setSecrets([...secrets, currentSecret.trim()]);
      setCurrentSecret('');
    } catch (err) {
      Alert.alert('Error', 'Could not screen secret. Please try again.');
    } finally {
      setIsScreening(false);
    }
  };

  const handleRemoveSecret = (secretToRemove: string) => {
    setSecrets(secrets.filter(secret => secret !== secretToRemove));
  };

  const handleContinue = async () => {
    try {
      const session = supabase.auth.session();
      const userId = session?.user?.id;
      if (!userId) {
        Alert.alert('Error', 'You must be logged in to add secrets');
        return;
      }
      if (!group_id) {
        Alert.alert('Error', 'Group not found.');
        return;
      }
      const { error: insertError } = await supabase
        .from('secrets')
        .insert(
          secrets
            .filter(secret => secret.trim())
            .map(secret => ({
            user_id: userId,
              content: secret,
            group_id: group_id,
            created_at: new Date().toISOString(),
          }))
        );
      if (insertError) {
        Alert.alert('Error', 'Could not save secrets.');
        return;
      }
      navigation.navigate('PatientDashboard');
    } catch (e) {
      Alert.alert('Error', 'Failed to save secrets');
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
          <Text style={styles.stepText}>Step 4 of 4</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Your Secrets</Text>

        <View style={styles.mainContent}>
          <Text style={styles.heading}>Your Motivation to Stay on Track</Text>
          <Text style={styles.description}>
            Add at least 2 secrets you'd prefer to keep private. These will be revealed to your
            friends if you miss your health goals.
          </Text>

          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Ionicons name="lock-closed" size={24} color="#E86D6D" />
            </View>
            <Text style={styles.infoTitle}>Your secrets are secure</Text>
            <Text style={styles.infoDescription}>
              Secrets are encrypted and only revealed to your friends if you miss goals. We never read your content.
            </Text>
          </View>

          <View style={styles.secretInputContainer}>
            <TextInput
              style={styles.secretInput}
              placeholder="Type a secret here..."
              value={currentSecret}
              onChangeText={setCurrentSecret}
              multiline
              maxLength={200}
            />
            <TouchableOpacity 
              style={[
                styles.saveButton,
                isScreening && styles.saveButtonDisabled
              ]}
              onPress={handleAddSecret}
              disabled={isScreening}
            >
              <Text style={styles.saveButtonText}>
                {isScreening ? 'Screening...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.secretsSection}>
            <Text style={styles.secretsCount}>Added Secrets: {secrets.length}/{requiredSecrets}</Text>
            {secrets.map(secret => (
              <View key={secret} style={styles.secretItem}>
                <View style={styles.secretContent}>
                  <Ionicons name="lock-closed" size={20} color="#4A6FFF" />
                  <Text style={styles.secretText}>{secret}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleRemoveSecret(secret)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            secrets.length < requiredSecrets && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={secrets.length < requiredSecrets}
        >
          <Text style={styles.continueButtonText}>
            {secrets.length >= requiredSecrets 
              ? 'Continue'
              : `Continue (${remainingSecrets} more needed)`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('PatientDashboard')}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
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
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  secretInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  secretInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
    maxHeight: 100,
  },
  saveButton: {
    backgroundColor: '#4A6FFF',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#DDD',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secretsSection: {
    gap: 12,
  },
  secretsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6FFF',
  },
  secretItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  secretContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secretText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  continueButton: {
    backgroundColor: '#E86D6D',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#DDD',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E86D6D',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#E86D6D',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PatientAddSecrets; 