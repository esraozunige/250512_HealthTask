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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientPrivacyPolicy'>;

const PatientPrivacyPolicy = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.text}>
            We collect information that you provide directly to us, including your name, email
            address, health tasks, and any secrets you choose to share for accountability purposes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.text}>
            Your information is used to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Provide and maintain the Health Task App services</Text>
            <Text style={styles.bulletPoint}>• Track your progress with health tasks</Text>
            <Text style={styles.bulletPoint}>• Facilitate accountability with your chosen group</Text>
            <Text style={styles.bulletPoint}>• Communicate important updates and notifications</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.text}>
            We only share your information with members of your accountability group as explicitly
            authorized by you. Your secrets are only revealed according to the accountability rules
            you agree to.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.text}>
            We implement appropriate security measures to protect your personal information. Your
            secrets are encrypted and stored securely.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.text}>
            You have the right to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Access your personal information</Text>
            <Text style={styles.bulletPoint}>• Correct inaccurate information</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
            <Text style={styles.bulletPoint}>• Opt-out of communications</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Changes to Privacy Policy</Text>
          <Text style={styles.text}>
            We may update this privacy policy from time to time. We will notify you of any changes
            by posting the new policy on this page.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about this Privacy Policy, please contact us at
            privacy@healthtaskapp.com
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
    marginBottom: 12,
  },
  bulletPoints: {
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 4,
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

export default PatientPrivacyPolicy; 