import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientTermsOfService'>;

const PatientTermsOfService = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Terms of Service</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using the Health Task App, you agree to be bound by these Terms of Service
            and all applicable laws and regulations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Privacy and Data Protection</Text>
          <Text style={styles.text}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and
            protect your personal information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
          <Text style={styles.text}>
            You are responsible for maintaining the confidentiality of your account and for all
            activities that occur under your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Health Information</Text>
          <Text style={styles.text}>
            The app is designed to help you manage your health tasks and accountability. It is not a
            substitute for professional medical advice, diagnosis, or treatment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Secret Sharing</Text>
          <Text style={styles.text}>
            The app includes features for sharing secrets as accountability measures. You are
            responsible for the content of your secrets and understand that they may be revealed to
            your accountability group if you fail to complete your health tasks.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Modifications</Text>
          <Text style={styles.text}>
            We reserve the right to modify these terms at any time. Continued use of the app after
            changes constitutes acceptance of the modified terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Termination</Text>
          <Text style={styles.text}>
            We reserve the right to terminate or suspend your account at any time for violations of
            these terms or inappropriate behavior.
          </Text>
        </View>

        <View style={styles.lastUpdated}>
          <Text style={styles.lastUpdatedText}>Last Updated: May 2024</Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  lastUpdated: {
    padding: 20,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 14,
    color: '#999',
  },
});

export default PatientTermsOfService; 