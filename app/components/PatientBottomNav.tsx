import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type PatientBottomNavProps = {
  activeTab: 'Dashboard' | 'Tasks' | 'Group' | 'Settings';
  patientData?: any;
};

const PatientBottomNav = ({ activeTab, patientData }: PatientBottomNavProps) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('PatientDashboard')}
      >
        <Ionicons
          name={activeTab === 'Dashboard' ? 'home' : 'home-outline'}
          size={24}
          color={activeTab === 'Dashboard' ? '#E86D6D' : '#666'}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'Dashboard' && styles.activeTabText,
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('PatientTaskList')}
      >
        <Ionicons
          name={activeTab === 'Tasks' ? 'calendar' : 'calendar-outline'}
          size={24}
          color={activeTab === 'Tasks' ? '#E86D6D' : '#666'}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'Tasks' && styles.activeTabText,
          ]}
        >
          Tasks
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('PatientGroup')}
      >
        <Ionicons
          name={activeTab === 'Group' ? 'people' : 'people-outline'}
          size={24}
          color={activeTab === 'Group' ? '#E86D6D' : '#666'}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'Group' && styles.activeTabText,
          ]}
        >
          Group
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('PatientSettings')}
      >
        <Ionicons
          name={activeTab === 'Settings' ? 'settings' : 'settings-outline'}
          size={24}
          color={activeTab === 'Settings' ? '#E86D6D' : '#666'}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'Settings' && styles.activeTabText,
          ]}
        >
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#E86D6D',
  },
});

export default PatientBottomNav; 