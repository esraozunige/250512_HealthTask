import React, { useState } from 'react';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientHelpCenter'>;

interface FAQItem {
  question: string;
  answer: string;
  isExpanded: boolean;
}

const PatientHelpCenter = () => {
  const navigation = useNavigation<NavigationProp>();
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      question: 'How does the accountability system work?',
      answer: 'When you miss a health task, one of your secrets may be revealed to your accountability group. This creates motivation to stay on track with your health goals.',
      isExpanded: false,
    },
    {
      question: 'How are my secrets protected?',
      answer: 'Your secrets are encrypted and only revealed according to the accountability rules you agree to. We never read or access your secret content.',
      isExpanded: false,
    },
    {
      question: 'Can I change my accountability group?',
      answer: 'Yes, you can manage your accountability group members in the Group settings. Changes require confirmation from your doctor.',
      isExpanded: false,
    },
    {
      question: 'What happens if I miss a task?',
      answer: 'Missing a task may result in one of your secrets being revealed to your accountability group. You\'ll receive a notification before this happens.',
      isExpanded: false,
    },
    {
      question: 'How do I add or modify tasks?',
      answer: 'You can create personal tasks or your doctor can assign tasks to you. Manage your tasks in the Tasks section of the app.',
      isExpanded: false,
    },
  ]);

  const toggleFAQ = (index: number) => {
    setFaqs(faqs.map((faq, i) => ({
      ...faq,
      isExpanded: i === index ? !faq.isExpanded : false,
    })));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Help Center</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <Text style={styles.description}>
            Find answers to common questions below or contact our support team for assistance.
          </Text>
        </View>

        <View style={styles.supportOptions}>
          <TouchableOpacity style={styles.supportOption}>
            <View style={styles.supportIconContainer}>
              <Ionicons name="mail" size={24} color="#E86D6D" />
            </View>
            <Text style={styles.supportOptionTitle}>Email Support</Text>
            <Text style={styles.supportOptionText}>support@healthtaskapp.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportOption}>
            <View style={styles.supportIconContainer}>
              <Ionicons name="chatbubbles" size={24} color="#E86D6D" />
            </View>
            <Text style={styles.supportOptionTitle}>Live Chat</Text>
            <Text style={styles.supportOptionText}>Available 9 AM - 5 PM</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={faq.isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </View>
              {faq.isExpanded && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
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
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  supportOptions: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  supportOption: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  supportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  supportOptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  faqSection: {
    padding: 20,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginTop: 12,
  },
});

export default PatientHelpCenter; 