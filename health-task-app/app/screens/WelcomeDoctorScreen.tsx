import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WelcomeDoctor'>;

const WelcomeDoctorScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleCreateAccount = () => {
    navigation.navigate('CreateDoctorAccount');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, Doctor</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Thank You for Joining</Text>
        <Text style={styles.subtitle}>
          You're about to help your patients improve their health habits through accountability.
        </Text>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={24} color="#4A6FFF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Invite Patients</Text>
              <Text style={styles.featureDescription}>
                Send invitations to your patients to join Secret Reveal.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="clipboard" size={24} color="#4A6FFF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Create Health Tasks</Text>
              <Text style={styles.featureDescription}>
                Design personalized health tasks for your patients.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart" size={24} color="#4A6FFF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Monitor Progress</Text>
              <Text style={styles.featureDescription}>
                Track your patients' adherence to health goals.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
          <Text style={styles.buttonText}>Create Your Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#4A6FFF',
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresContainer: {
    gap: 24,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#E6EBFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4A6FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WelcomeDoctorScreen; 