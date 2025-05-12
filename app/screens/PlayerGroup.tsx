import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  UIManager,
  findNodeHandle,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import * as ImagePicker from 'expo-image-picker';
import PlayerBottomNav from '../components/PlayerBottomNav';
import { rewriteWithGemini } from '../lib/gemini';
import { groupFeedService, FeedItem, FeedItemType, PaginatedResponse } from '../services/groupFeedService';
import { supabase } from '../../lib/supabase';
import { Video, ResizeMode } from 'expo-av';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FeedItemSkeleton } from '../components/FeedItemSkeleton';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerGroup'>;

interface GroupMember {
  id: string;
  name: string;
  streak: number;
  tasksCompleted: number;
  rank: number;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes?: number;
  hasLiked?: boolean;
  replies?: Comment[];
}

interface Post {
  id: string;
  author: {
    name: string;
    isDoctor?: boolean;
  };
  content: string;
  timestamp: string;
  type: 'task' | 'update' | 'feeling';
  taskName?: string;
  likes: number;
  comments: number;
  hasLiked?: boolean;
  commentSection?: {
    isOpen: boolean;
    comments: Comment[];
  };
  image?: string;
}

const mockMembers: GroupMember[] = [
  {
    id: '1',
    name: 'Michael Brown',
    streak: 32,
    tasksCompleted: 45,
    rank: 1,
  },
  {
    id: '2',
    name: 'Jennifer Favre',
    streak: 28,
    tasksCompleted: 40,
    rank: 2,
  },
  {
    id: '3',
    name: 'Emma Davis',
    streak: 25,
    tasksCompleted: 38,
    rank: 3,
  },
];

const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Deen Rufus',
    },
    content: 'Just completed my morning meditation! 🧘‍♂️ Day 5 streak going strong! Feeling centered and ready for the day.',
    timestamp: '2 hours ago',
    type: 'task',
    taskName: 'Morning Meditation',
    likes: 2,
    comments: 3,
  },
  {
    id: '2',
    author: {
      name: 'Dr. Camilla Johnson',
      isDoctor: true,
    },
    content: 'Great job everyone on your progress this week! Remember to log your blood pressure readings daily, and don\'t forget to stay hydrated in this heat. 💧',
    timestamp: '3 hours ago',
    type: 'update',
    likes: 2,
    comments: 2,
  },
];

const PlayerGroup = () => {
  const navigation = useNavigation<NavigationProp>();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState<string>(''); // You'll need to get this from your group context or params
  const [timeFilter, setTimeFilter] = useState<'This Month' | 'All Time'>('This Month');
  const [newComment, setNewComment] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [replyTo, setReplyTo] = useState<{ postId: string; commentId?: string; author?: string } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const postRefs = useRef<{ [postId: string]: View | null }>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostText, setEditingPostText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ postId: string } | null>(null);
  const [activeReply, setActiveReply] = useState<{ postId: string; commentId: string | null } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingReply, setEditingReply] = useState<{ postId: string; commentId: string; parentId?: string } | null>(null);
  const [editingReplyText, setEditingReplyText] = useState('');
  const [deletingReply, setDeletingReply] = useState<{ postId: string; commentId: string; parentId?: string } | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isRewritingPost, setIsRewritingPost] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const currentUser = {
    id: '7',
    name: 'Deen Rufus',
    streak: 12,
    rank: 7,
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    fetchFeedItems();
    const subscription = groupFeedService.subscribeToFeed(groupId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setFeedItems(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setFeedItems(prev => prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        ));
      } else if (payload.eventType === 'DELETE') {
        setFeedItems(prev => prev.filter(item => item.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [groupId]);

  const fetchFeedItems = async (refresh = false) => {
    try {
      if (!groupId) return;
      setLoading(true);
      const response = await groupFeedService.getFeedItems(
        groupId,
        10,
        refresh ? undefined : nextCursor || undefined
      );
      
      if (refresh) {
        setFeedItems(response.data);
      } else {
        setFeedItems(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch feed items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeedItems(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchFeedItems();
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !selectedMedia) return;

    try {
      setUploading(true);
      let mediaFile: { uri: string; type: string } | undefined;

      if (selectedMedia) {
        mediaFile = {
          uri: selectedMedia.uri,
          type: selectedMedia.type
        };
      }

      const newItem = await groupFeedService.addFeedItem(
        groupId,
        user?.id || '',
        'comment' as FeedItemType,
        newPost.trim(),
        undefined,
        undefined,
        mediaFile
      );

      setFeedItems([newItem, ...feedItems]);
      setNewPost('');
      setSelectedMedia(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to post message');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePost = async (itemId: string) => {
    try {
      await groupFeedService.deleteFeedItem(itemId);
      setFeedItems(feedItems.filter(item => item.id !== itemId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const handleEditPost = async (itemId: string, newContent: string) => {
    try {
      const updatedItem = await groupFeedService.updateFeedItem(itemId, newContent);
      setFeedItems(feedItems.map(item => 
        item.id === itemId ? updatedItem : item
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update post');
    }
  };

  const handleAddComment = async (parentId: string, content: string) => {
    if (!content.trim() || !user) return;
    try {
      await groupFeedService.addComment(groupId, user.id, parentId, content);
      await fetchFeedItems();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddReaction = async (postId: string, reaction: string) => {
    if (!user) return;
    try {
      await groupFeedService.addFeedItem(
        groupId,
        user.id,
        'reaction',
        reaction,
        undefined,
        postId
      );
      handleRefresh();
    } catch (error) {
      Alert.alert('Error', 'Failed to add reaction');
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setNewPostImage(result.assets[0].uri);
    }
  };

  const handleReply = (postId: string, commentId?: string, author?: string) => {
    setReplyTo({ postId, commentId, author });
    setTimeout(() => {
      const postRef = postRefs.current[postId];
      const scrollViewNode = findNodeHandle(scrollViewRef.current);
      const postNode = findNodeHandle(postRef);
      if (postNode && scrollViewNode) {
        UIManager.measureLayout(
          postNode,
          scrollViewNode,
          () => {},
          (x, y) => {
            scrollViewRef.current?.scrollTo({ y: Math.max(y - 100, 0), animated: true });
          }
        );
      }
    }, 350);
  };

  const handleAddCommentToPost = (postId: string, content: string) => {
    setFeedItems(feedItems.map(item => 
      item.id === postId 
        ? { 
            ...item, 
            comments: [...(item.comments || []), {
              id: Date.now().toString(),
              group_id: item.group_id,
              user_id: currentUser.id,
              type: 'comment' as FeedItemType,
              content,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user: {
                full_name: currentUser.name,
                role: 'player'
              }
            } as FeedItem]
          } as FeedItem
        : item
    ));
    setNewComment('');
    Keyboard.dismiss();
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return styles.goldBadge;
      case 2:
        return styles.silverBadge;
      case 3:
        return styles.bronzeBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const handleReplyToComment = (postId: string, commentId: string, parentCommentId?: string) => {
    setActiveReply({ postId, commentId });
    setReplyText('');
  };

  const handleSendReply = () => {
    if (!activeReply || !replyText.trim()) return;
    setFeedItems(feedItems.map(item => 
      item.id === activeReply.postId 
        ? { 
            ...item, 
            comments: [...(item.comments || []), {
              id: Date.now().toString(),
              group_id: item.group_id,
              user_id: currentUser.id,
              type: 'comment' as FeedItemType,
              content: replyText,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user: {
                full_name: currentUser.name,
                role: 'player'
              }
            } as FeedItem]
          } as FeedItem
        : item
    ));
    setActiveReply(null);
    setReplyText('');
  };

  const handleEditReply = (postId: string, commentId: string, parentId?: string, text = '') => {
    setEditingReply({ postId, commentId, parentId });
    setEditingReplyText(text);
  };

  const handleSaveEditReply = () => {
    if (!editingReply) return;
    setFeedItems(feedItems.map(item => 
      item.id === editingReply.postId 
        ? { ...item, comments: item.comments?.map(comment => 
          comment.id === editingReply.commentId 
            ? { ...comment, content: editingReplyText }
            : comment
        ) || [] }
        : item
    ));
    setEditingReply(null);
    setEditingReplyText('');
  };

  const handleCancelEditReply = () => {
    setEditingReply(null);
    setEditingReplyText('');
  };

  const handleDeleteReply = (postId: string, commentId: string, parentId?: string) => {
    setDeletingReply({ postId, commentId, parentId });
  };

  const confirmDeleteReply = () => {
    if (!deletingReply) return;
    setFeedItems(feedItems.map(item => 
      item.id === deletingReply.postId 
        ? { ...item, comments: item.comments?.filter(comment => 
          !(comment.id === deletingReply.commentId && deletingReply.parentId === comment.id) ) || [] }
        : item
    ));
    setDeletingReply(null);
  };

  const cancelDeleteReply = () => {
    setDeletingReply(null);
  };

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedMedia({
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'image',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const renderFeedItem = (item: FeedItem) => {
    const isCurrentUser = item.user_id === currentUser.id;

    return (
      <ErrorBoundary>
      <View key={item.id} style={styles.feedItem}>
        <View style={styles.feedItemHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.user?.full_name}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          {isCurrentUser && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEditPost(item.id, item.content)}>
                <Ionicons name="pencil" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
                <Ionicons name="trash" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.feedContent}>{item.content}</Text>
          {item.media_url && (
            <View style={styles.mediaContainer}>
              {item.media_type === 'image' ? (
                <Image
                  source={{ uri: groupFeedService.getMediaUrl(item.media_url) }}
                  style={styles.media}
                  resizeMode="cover"
                />
              ) : (
                <Video
                  source={{ uri: groupFeedService.getMediaUrl(item.media_url) }}
                  style={styles.media}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                />
              )}
            </View>
          )}
        <View style={styles.interactions}>
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => handleAddReaction(item.id, '👍')}
          >
            <Ionicons name="thumbs-up" size={20} color="#666" />
            <Text style={styles.interactionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => handleAddComment(item.id, '')}
          >
            <Ionicons name="chatbubble" size={20} color="#666" />
            <Text style={styles.interactionText}>Comment</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ErrorBoundary>
    );
  };

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((key) => (
        <FeedItemSkeleton key={key} style={styles.skeletonItem} />
      ))}
    </View>
  );

  return (
    <ErrorBoundary>
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Group Feed</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
          <ScrollView
            style={styles.feed}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            onScroll={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const paddingToBottom = 20;
              if (
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - paddingToBottom
              ) {
                handleLoadMore();
              }
            }}
            scrollEventThrottle={400}
          >
            {loading && !refreshing ? (
              <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            feedItems.map(item => renderFeedItem(item))
          )}
            {!hasMore && feedItems.length > 0 && (
              <Text style={styles.endOfFeed}>No more posts to load</Text>
            )}
        </ScrollView>

        <View style={styles.inputContainer}>
            {selectedMedia && (
              <View style={styles.selectedMediaContainer}>
                <Image
                  source={{ uri: selectedMedia.uri }}
                  style={styles.selectedMedia}
                />
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => setSelectedMedia(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Write something..."
            value={newPost}
            onChangeText={setNewPost}
            multiline
          />
          <TouchableOpacity 
                style={styles.mediaButton}
                onPress={pickMedia}
              >
                <Ionicons name="image" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.postButton, (!newPost.trim() && !selectedMedia) && styles.postButtonDisabled]}
            onPress={handlePost}
                disabled={!newPost.trim() && !selectedMedia || uploading}
          >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
            <Ionicons name="send" size={24} color="#fff" />
                )}
          </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>

      <PlayerBottomNav navigation={navigation} activeTab="Group" />
    </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#E15B64',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  feed: {
    flex: 1,
    padding: 16,
  },
  feedItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  feedContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  interactions: {
    flexDirection: 'row',
    gap: 16,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  interactionText: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E15B64',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  goldBadge: {
    backgroundColor: '#FFD700',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  silverBadge: {
    backgroundColor: '#C0C0C0',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  bronzeBadge: {
    backgroundColor: '#CD7F32',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#E0E0E0',
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  mediaContainer: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: 200,
  },
  selectedMediaContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  selectedMedia: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaButton: {
    padding: 8,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  endOfFeed: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonItem: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default PlayerGroup; 