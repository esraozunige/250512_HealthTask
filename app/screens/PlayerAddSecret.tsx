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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import { screenSecretWithGemini } from '../lib/gemini';
import { addSecret } from '../lib/secrets';

const MIN_SECRETS = 5;

type PlayerAddSecretRouteProp = RouteProp<RootStackParamList, 'PlayerAddSecret'>;

const PlayerAddSecret = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'PlayerAddSecret'>>();
  const route = useRoute<PlayerAddSecretRouteProp>();
  const { group_id } = route.params;
  const [secret, setSecret] = useState('');
  const [secrets, setSecrets] = useState<string[]>(['', '', '', '', '']);
  const [isScreening, setIsScreening] = useState(false);

  const handleAddSecret = async () => {
    if (!secret.trim() || secrets.includes(secret.trim())) return;
    setIsScreening(true);
    try {
      const isValid = await screenSecretWithGemini(secret.trim());
      if (!isValid) {
        Alert.alert('Not a valid secret', 'Please enter a more private, sensitive, and meaningful secret.');
        setIsScreening(false);
        return;
      }
      setSecrets([...secrets, secret.trim()]);
      setSecret('');
    } catch (err) {
      Alert.alert('Error', 'Could not screen secret. Please try again.');
    } finally {
      setIsScreening(false);
    }
  };

  const handleRemoveSecret = (idx: number) => {
    setSecrets(secrets.filter((_, i) => i !== idx));
  };

  const handleContinue = async () => {
    try {
      for (const secret of secrets) {
        if (secret.trim()) {
          await addSecret(secret.trim());
        }
      }
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
      const secretsToInsert = secrets.map(content => ({
        user_id: userId,
        group_id,
        content,
      }));
      const { error } = await supabase.from('secrets').insert(secretsToInsert);
      if (error) {
        Alert.alert('Error', 'Could not save secrets.');
        return;
      }
      navigation.navigate('PlayerCreateTask');
    } catch (e) {
      Alert.alert('Error', 'Failed to save secrets');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#6B5ECD" />
          </TouchableOpacity>
          <Text style={styles.header}>Add Your Secrets</Text>
          <Text style={styles.stepText}>• Step 2 of 3</Text>
          <Text style={styles.title}>Your Motivation to Stay on Track</Text>
          <Text style={styles.desc}>
            Add at least 5 secrets you'd prefer to keep private. These will be revealed to your friends if you miss your health goals.
          </Text>
          <View style={styles.infoBox}>
            <Ionicons name="lock-closed" size={22} color="#6B5ECD" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Your secrets are secure</Text>
              <Text style={styles.infoDesc}>
                Secrets are encrypted and only revealed to your friends if you miss goals. We never read your content.
              </Text>
            </View>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a secret here..."
              value={secret}
              onChangeText={setSecret}
              multiline
            />
            <TouchableOpacity
              style={[styles.saveButton, !secret.trim() && { opacity: 0.5 }, isScreening && { opacity: 0.5 }]}
              onPress={handleAddSecret}
              disabled={!secret.trim() || isScreening}
            >
              <Text style={styles.saveButtonText}>
                {isScreening ? 'Screening...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addedText}>
            Added Secrets: <Text style={styles.addedCount}>{secrets.length}</Text>/<Text style={styles.addedCount}>{MIN_SECRETS}</Text>
          </Text>
          {secrets.map((s, idx) => (
            <View key={idx} style={styles.secretCard}>
              <Ionicons name="lock-closed" size={18} color="#6B5ECD" style={{ marginRight: 8 }} />
              <Text style={styles.secretText}>{s}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemoveSecret(idx)}>
                <Ionicons name="trash-outline" size={20} color="#888" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, secrets.length < MIN_SECRETS && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={secrets.length < MIN_SECRETS}
        >
          <Text style={styles.continueButtonText}>
            Continue ({secrets.length < MIN_SECRETS ? `${MIN_SECRETS - secrets.length} more needed` : 'Ready'})
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 120,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F5F6FA',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6B5ECD',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 15,
    color: '#6B5ECD',
    fontWeight: '500',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    color: '#444',
    marginBottom: 18,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    gap: 8,
  },
  infoTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#6B5ECD',
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 13,
    color: '#666',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F8F8FF',
    minHeight: 48,
    maxHeight: 80,
  },
  saveButton: {
    backgroundColor: '#B39DFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#6B5ECD',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addedText: {
    fontSize: 15,
    color: '#444',
    marginTop: 8,
    marginBottom: 8,
  },
  addedCount: {
    color: '#6B5ECD',
    fontWeight: 'bold',
  },
  secretCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    gap: 8,
  },
  secretText: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
  footer: {
    backgroundColor: 'transparent',
    padding: 24,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  continueButton: {
    backgroundColor: '#6B5ECD',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  continueButtonDisabled: {
    backgroundColor: '#DDD',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default PlayerAddSecret; 