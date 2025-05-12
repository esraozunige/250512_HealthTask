import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerTaskCompleted'>;
type PlayerTaskCompletedRouteProp = RouteProp<RootStackParamList, 'PlayerTaskCompleted'>;

const PlayerTaskCompleted = () => {
  const navigation = useNavigation<NavigationProp>();
  // For now, use mock data since route.params is not yet wired
  const taskData = {
    title: 'Daily Walk',
    description: 'Walk at least 8,000 steps today',
    proofImage: undefined,
    feeling: 'Feeling great after my walk!',
  };

  const handleTaskDashboard = () => {
    navigation.navigate('PlayerDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#6B5ECD" />
          <Text style={styles.headerTitle}>Task Completed</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={48} color="#4CAF50" />
          </View>
        </View>
        <Text style={styles.title}>Task Completed!</Text>
        <Text style={styles.subtitle}>
          Your daily walk has been verified. Your secrets are safe for now!
        </Text>
        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={styles.taskIconContainer}>
              <Text style={styles.taskIcon}>🚶‍♂️</Text>
            </View>
            <Text style={styles.completedBadge}>Completed</Text>
          </View>
          <Text style={styles.taskTitle}>{taskData.title}</Text>
          <Text style={styles.taskDescription}>{taskData.description}</Text>
          {taskData.proofImage && (
            <Image
              source={{ uri: taskData.proofImage }}
              style={styles.proofImage}
            />
          )}
          {taskData.feeling && (
            <Text style={styles.completionNote}>{taskData.feeling}</Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.dashboardButton}
            onPress={handleTaskDashboard}
          >
            <Text style={styles.dashboardButtonText}>Task Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#F5F6FA',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B5ECD',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  checkmark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 24,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskIconContainer: {
    backgroundColor: '#F5F7FF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskIcon: {
    fontSize: 24,
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  completionNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dashboardButton: {
    flex: 1,
    backgroundColor: '#6B5ECD',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlayerTaskCompleted; 