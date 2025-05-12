import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import PatientBottomNav from '../components/PatientBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientSettings'>;

const PatientSettings = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const renderSettingItem = (
    icon: string,
    title: string,
    onPress: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#666" />
        <Text style={styles.settingText}>{title}</Text>
      </View>
      <View style={styles.settingRight}>
        {rightElement || (
          <Ionicons name="chevron-forward" size={24} color="#666" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {renderSettingItem(
            'person-outline',
            'My Profile',
            () => navigation.navigate('PatientProfile')
          )}
          {renderSettingItem(
            'lock-closed-outline',
            'Manage Secrets',
            () => navigation.navigate('PatientManageSecrets')
          )}
          {renderSettingItem(
            'list-outline',
            'Manage Tasks',
            () => navigation.navigate('PatientManageTasks')
          )}
          {renderSettingItem(
            'notifications-outline',
            'Notifications',
            () => {},
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#DDD', true: '#E86D6D' }}
              thumbColor="#fff"
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          {renderSettingItem(
            'key-outline',
            'Change Password',
            () => navigation.navigate('PatientChangePassword')
          )}
          {renderSettingItem(
            'shield-outline',
            'Privacy Settings',
            () => navigation.navigate('PatientPrivacySettings')
          )}
          {renderSettingItem(
            'document-text-outline',
            'Terms of Service',
            () => navigation.navigate('PatientTermsOfService')
          )}
          {renderSettingItem(
            'lock-closed-outline',
            'Privacy Policy',
            () => navigation.navigate('PatientPrivacyPolicy')
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {renderSettingItem(
            'help-circle-outline',
            'Help Center',
            () => navigation.navigate('PatientHelpCenter')
          )}
        </View>
      </ScrollView>

      <PatientBottomNav activeTab="Profile" />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default PatientSettings; 