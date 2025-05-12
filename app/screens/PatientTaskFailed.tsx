import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { supabase } from '../../lib/supabase';
import { revealRandomSecret } from '../lib/secrets';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientTaskFailed'>;
type PatientTaskFailedRouteProp = RouteProp<RootStackParamList, 'PatientTaskFailed'>;

interface TaskFailedProps {
  taskTitle: string;
  taskDescription: string;
  secret: string;
  friendComment?: {
    name: string;
    comment: string;
    avatar?: ImageSourcePropType;
  };
  proofImage: ImageSourcePropType;
}

const PatientTaskFailed = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PatientTaskFailedRouteProp>();
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  // Mock data - in real app this would come from route.params
  const taskData: TaskFailedProps = {
    taskTitle: 'Cardio Workout',
    taskDescription: '30 minutes of cardio exercise (3x Weekly)',
    secret: 'I accidentally ate dog food last week. Not once, but twice.',
    friendComment: {
      name: 'Sarah',
      comment: 'Hahah, how did it taste then? That\'s quite a culinary adventure!',
      avatar: require('../../assets/sarah-avatar.png'),
    },
    proofImage: require('../../assets/proof-image.jpg'),
  };

  useEffect(() => {
    const revealSecret = async () => {
      try {
        const user = await supabase.auth.user();
        if (user) {
          const secret = await revealRandomSecret(user.id);
          setRevealedSecret(secret.content);
        }
      } catch (e) {
        setRevealedSecret('No secrets left to reveal!');
      }
    };
    revealSecret();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.headerTitle}>Task Failed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.failureIcon}>
          <Ionicons name="close" size={48} color="#E86D6D" />
        </View>

        <Text style={styles.title}>Oh no! Task Failed</Text>
        <Text style={styles.subtitle}>
          You missed your cardio workout. A secret has been revealed to your friends.
        </Text>

        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={styles.taskIconContainer}>
              <Ionicons name="heart" size={24} color="#E86D6D" />
            </View>
            <View style={styles.failedBadge}>
              <Text style={styles.failedText}>Failed</Text>
            </View>
          </View>

          <Text style={styles.taskTitle}>{taskData.taskTitle}</Text>
          <Text style={styles.taskDescription}>{taskData.taskDescription}</Text>

          <View style={styles.secretContainer}>
            <View style={styles.secretHeader}>
              <Ionicons name="lock-open" size={20} color="#E86D6D" />
              <Text style={styles.secretTitle}>Secret Revealed</Text>
            </View>
            <Text style={styles.secretText}>{revealedSecret}</Text>
          </View>

          {taskData.friendComment && (
            <View style={styles.commentContainer}>
              <Image
                source={taskData.friendComment.avatar}
                style={styles.friendAvatar}
              />
              <View style={styles.commentContent}>
                <Text style={styles.friendName}>{taskData.friendComment.name}</Text>
                <Text style={styles.commentText}>
                  {taskData.friendComment.comment}
                </Text>
              </View>
            </View>
          )}

          <Image
            source={taskData.proofImage}
            style={styles.proofImage}
            resizeMode="cover"
          />
        </View>

        <TouchableOpacity 
          style={styles.dashboardButton}
          onPress={() => navigation.navigate('PatientDashboard')}
        >
          <Text style={styles.dashboardButtonText}>Task Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#4A6FFF" />
        </TouchableOpacity>
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
    padding: 20,
    alignItems: 'center',
  },
  failureIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  taskCard: {
    width: '100%',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedBadge: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  failedText: {
    color: '#E86D6D',
    fontSize: 14,
    fontWeight: '500',
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
  secretContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  secretHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  secretTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E86D6D',
  },
  secretText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
  },
  dashboardButton: {
    backgroundColor: '#4A6FFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  dashboardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 16,
  },
});

export default PatientTaskFailed; 