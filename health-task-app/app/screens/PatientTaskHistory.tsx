import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import PatientBottomNav from '../components/PatientBottomNav';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientTaskHistory'>;

interface TaskHistoryItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  status: 'completed' | 'failed';
  timestamp: string;
  details?: {
    stepsCompleted?: number;
    photoSubmitted?: boolean;
    medicationTaken?: boolean;
  };
  comments: number;
  proofImage: string;
  feeling: string;
}

const mockTaskHistory: TaskHistoryItem[] = [
  {
    id: '1',
    icon: '🚶‍♂️',
    title: 'Daily Walk',
    description: 'Walk at least 8,000 steps',
    status: 'completed',
    timestamp: 'Today, 3:45 PM',
    details: {
      stepsCompleted: 9234,
    },
    comments: 2,
    proofImage: 'https://placehold.co/300x200',
    feeling: 'Felt energized and refreshed!'
  },
  {
    id: '2',
    icon: '🥗',
    title: 'Healthy Meal',
    description: 'Post a photo of your healthy dinner',
    status: 'completed',
    timestamp: 'Yesterday, 7:30 PM',
    details: {
      photoSubmitted: true,
    },
    comments: 1,
    proofImage: 'https://placehold.co/300x200',
    feeling: 'Proud of my healthy choice!'
  },
  {
    id: '3',
    icon: '❤️',
    title: 'Medication',
    description: 'Take evening medication',
    status: 'completed',
    timestamp: '2 days ago, 8:00 PM',
    details: {
      medicationTaken: true,
    },
    comments: 3,
    proofImage: 'https://placehold.co/300x200',
    feeling: 'Glad I remembered!'
  },
];

const PatientTaskHistory = () => {
  const navigation = useNavigation<NavigationProp>();

  const renderTaskHistoryItem = (task: TaskHistoryItem) => {
    const isCompleted = task.status === 'completed';

    const renderTaskDetails = () => {
      if (task.details?.stepsCompleted) {
        return `${task.details.stepsCompleted} steps completed`;
      } else if (task.details?.photoSubmitted) {
        return 'Photo submitted';
      } else if (task.details?.medicationTaken) {
        return 'Medication taken';
      }
      return '';
    };

    return (
      <View key={task.id} style={styles.taskItem}>
        <View style={styles.taskIcon}>
          <Text style={styles.taskIconText}>{task.icon}</Text>
        </View>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDescription}>{task.description}</Text>
          <View style={styles.taskMeta}>
            <Text style={styles.taskDetail}>{renderTaskDetails()}</Text>
            <View style={styles.commentContainer}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.commentCount}>{task.comments} comments</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate('PatientTaskCompleted', {
            taskData: {
              title: task.title,
              description: task.description,
              proofImage: task.proofImage,
              feeling: task.feeling,
            }
          })}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task History</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.performanceContainer}>
          <Text style={styles.sectionTitle}>Task Performance</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>92%</Text>
              <Text style={styles.metricLabel}>Completion Rate</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>87</Text>
              <Text style={styles.metricLabel}>Tasks Completed</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>12</Text>
              <Text style={styles.metricLabel}>Current Streak</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricValue}>1</Text>
              <Text style={styles.metricLabel}>Secrets Revealed</Text>
            </View>
          </View>
        </View>

        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent Tasks</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="filter" size={20} color="#4A6FFF" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>
          {mockTaskHistory.map(renderTaskHistoryItem)}
        </View>
      </ScrollView>

      <PatientBottomNav activeTab="Tasks" />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  performanceContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6FFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  historyContainer: {
    padding: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    color: '#4A6FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskIconText: {
    fontSize: 20,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskDetail: {
    fontSize: 14,
    color: '#4A6FFF',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCount: {
    fontSize: 14,
    color: '#666',
  },
  viewButton: {
    marginLeft: 12,
  },
  viewButtonText: {
    color: '#4A6FFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PatientTaskHistory; 