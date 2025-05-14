import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  activeTab: 'Home' | 'Tasks' | 'Patients' | 'Profile' | 'Groups';
};

const DoctorBottomNav = ({ activeTab }: Props) => {
  const navigation = useNavigation<NavigationProp>();

  const tabs = [
    {
      name: 'Patients',
      icon: 'people',
      screen: 'DoctorPatients',
    },
    {
      name: 'Tasks',
      icon: 'list',
      screen: 'DoctorTaskManagement',
    },
    {
      name: 'Groups',
      icon: 'people-circle',
      screen: 'DoctorGroupList',
    },
    {
      name: 'Settings',
      icon: 'settings',
      screen: 'DoctorSettings',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => navigation.navigate(tab.screen as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={24}
            color={activeTab === tab.name ? '#E86D6D' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === tab.name && styles.activeTabText,
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 15,
    paddingTop: 15,
    height: 90,
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
    fontWeight: '600',
  },
});

export default DoctorBottomNav; 