import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color="white" />
          </View>
          <Text style={styles.title}>Secret Reveal</Text>
          <Text style={styles.subtitle}>Health accountability with a twist</Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('DoctorLogin')}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>For Medical Professionals</Text>
              <Text style={styles.cardDescription}>Create accountability groups for your patients</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('PatientLogin')}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="heart" size={24} color="white" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>For Patients</Text>
              <Text style={styles.cardDescription}>Stay motivated with your health goals</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('PlayerLogin')}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="people" size={24} color="white" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>For Supporters</Text>
              <Text style={styles.cardDescription}>Help friends achieve their health goals</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            How it works: Complete health tasks to keep your secrets safe. Miss a task, and one of your secrets is revealed to your group.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B5ECD',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default LandingScreen; 