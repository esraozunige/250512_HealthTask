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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import * as ImagePicker from 'expo-image-picker';
import PatientBottomNav from '../components/PatientBottomNav';
import { rewriteWithGemini } from '../lib/gemini';
import { groupFeedService, FeedItem, FeedItemType } from '../services/groupFeedService';
import { supabase } from '../../lib/supabase';
import { getRevealedSecretsForGroup } from '../lib/secrets';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PatientGroup'>;

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

const PatientGroup = () => {
  const navigation = useNavigation<NavigationProp>();
  const [timeFilter, setTimeFilter] = useState<'This Month' | 'All Time'>('This Month');
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState<FeedItem[]>([]);
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
  const [editingReply, setEditingReply] = useState<{ postId: string; commentId: string; parentId?: string } | null>(null);
  const [editingReplyText, setEditingReplyText] = useState('');
  const [deletingReply, setDeletingReply] = useState<{ postId: string; commentId: string; parentId?: string } | null>(null);
  const [activeReply, setActiveReply] = useState<{ postId: string; commentId: string | null } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [isRewritingPost, setIsRewritingPost] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<any[]>([]);

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
  }, [groupId]);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await supabase.auth.user();
        if (!user) throw new Error('No user found');
        setCurrentUserId(user.id || null);
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchRevealed = async () => {
      try {
        if (groupId) {
          const data = await getRevealedSecretsForGroup(groupId);
          setRevealedSecrets(data || []);
        }
      } catch (e) {
        // handle error
      }
    };
    fetchRevealed();
  }, [groupId]);

  const fetchFeedItems = async () => {
    try {
      if (!groupId) return;
      const items = await groupFeedService.getFeedItems(groupId);
      setFeedItems(items);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch feed items');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: (post.likes || 0) + (post.hasLiked ? -1 : 1),
          hasLiked: !post.hasLiked,
        };
      }
      return post;
    }));
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

  const handlePost = async () => {
    if (!newPost.trim()) return;

    try {
      const newItem = await groupFeedService.addFeedItem(
        groupId,
        'comment',
        newPost.trim()
      );
      setFeedItems([newItem, ...feedItems]);
      setNewPost('');
    } catch (error) {
      Alert.alert('Error', 'Failed to post message');
    }
  };

  const handleComment = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          commentSection: {
            isOpen: !post.commentSection?.isOpen,
            comments: post.commentSection?.comments || []
          }
        };
      } else {
        return {
          ...post,
          commentSection: {
            isOpen: false,
            comments: post.commentSection?.comments || []
          }
        };
      }
    }));
    setActiveCommentPostId(postId);
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

  const handleAddComment = async (parentId: string, content: string) => {
    try {
      const newComment = await groupFeedService.addComment(groupId, parentId, content);
      setFeedItems(feedItems.map(item => 
        item.id === parentId 
          ? { ...item, comments: [...(item.comments || []), newComment] }
          : item
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
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

  const handleDeletePost = async (itemId: string) => {
    try {
      await groupFeedService.deleteFeedItem(itemId);
      setFeedItems(feedItems.filter(item => item.id !== itemId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const handleAddReaction = async (parentId: string, reaction: string) => {
    try {
      const newReaction = await groupFeedService.addReaction(groupId, parentId, reaction);
      setFeedItems(feedItems.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            reactions: [...(item.reactions || []), newReaction]
          };
        }
        return item;
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to add reaction');
    }
  };

  const handleRemoveReaction = async (parentId: string, reactionType: string) => {
    try {
      setFeedItems(feedItems.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            reactions: item.reactions?.filter(r => r.content !== reactionType) || []
          };
        }
        return item;
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to remove reaction');
    }
  };

  const handleEditReply = (postId: string, commentId: string, parentId?: string, text = '') => {
    setEditingReply({ postId, commentId, parentId });
    setEditingReplyText(text);
  };

  const handleSaveEditReply = () => {
    if (!editingReply) return;
    setFeedItems(feedItems => feedItems.map(item => {
      if (item.id !== editingReply.postId) return item;
      const updateComments = (comments: FeedItem[]): FeedItem[] =>
        comments.map(comment => {
          if (editingReply.parentId && comment.id === editingReply.parentId && comment.comments) {
            return {
              ...comment,
              comments: comment.comments.map(reply =>
                reply.id === editingReply.commentId
                  ? { ...reply, content: editingReplyText }
                  : reply
              ),
            };
          } else if (!editingReply.parentId && comment.id === editingReply.commentId) {
            return { ...comment, content: editingReplyText };
          } else if (comment.comments) {
            return { ...comment, comments: updateComments(comment.comments) };
          }
          return comment;
        });
      return {
        ...item,
        comments: updateComments(item.comments || []),
      };
    }));
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
    setFeedItems(feedItems => feedItems.map(item => {
      if (item.id !== deletingReply.postId) return item;
      const deleteComment = (comments: FeedItem[]): FeedItem[] =>
        comments.filter(comment => {
          if (deletingReply.parentId && comment.id === deletingReply.parentId && comment.comments) {
            comment.comments = comment.comments.filter(reply => reply.id !== deletingReply.commentId);
            return true;
          } else if (!deletingReply.parentId && comment.id === deletingReply.commentId) {
            return false;
          } else if (comment.comments) {
            comment.comments = deleteComment(comment.comments);
          }
          return true;
        });
      return {
        ...item,
        comments: deleteComment(item.comments || []),
      };
    }));
    setDeletingReply(null);
  };

  const cancelDeleteReply = () => {
    setDeletingReply(null);
  };

  const handleLikeComment = (postId: string, commentId: string, parentCommentId?: string) => {
    setFeedItems(feedItems => feedItems.map(item => {
      if (item.id !== postId) return item;
      const updateComments = (comments: FeedItem[]): FeedItem[] =>
        comments.map(comment => {
          if (parentCommentId && comment.id === parentCommentId && comment.comments) {
            return {
              ...comment,
              comments: comment.comments.map(reply =>
                reply.id === commentId
                  ? { ...reply, likes: (reply.likes || 0) + (reply.hasLiked ? -1 : 1), hasLiked: !reply.hasLiked }
                  : reply
              ),
            };
          } else if (!parentCommentId && comment.id === commentId) {
            return {
              ...comment,
              likes: (comment.likes || 0) + (comment.hasLiked ? -1 : 1),
              hasLiked: !comment.hasLiked,
            };
          } else if (comment.comments) {
            return { ...comment, comments: updateComments(comment.comments) };
          }
          return comment;
        });
      return {
        ...item,
        comments: updateComments(item.comments || []),
      };
    }));
  };

  const rewritePostWithAI = async () => {
    if (!newPost.trim()) return;
    setIsRewritingPost(true);
    try {
      const rewritten = await rewriteWithGemini(newPost.trim());
      setNewPost(rewritten);
    } catch (err) {
      alert('Could not rewrite post. Please try again.');
    } finally {
      setIsRewritingPost(false);
    }
  };

  const renderComments = (comments: FeedItem[], postId: string, parentId?: string, level = 0) =>
    comments.map(comment => (
      <View key={comment.id} style={[styles.commentContainer, { marginLeft: level * 20 }]}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{comment.user?.full_name}</Text>
          <Text style={styles.commentTimestamp}>{new Date(comment.created_at).toLocaleString()}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        {comment.comments && renderComments(comment.comments, postId, comment.id, level + 1)}
      </View>
    ));

  const renderPost = (item: FeedItem) => (
    <View
      key={item.id}
      style={styles.post}
    >
      <View style={styles.postHeader}>
        <Ionicons name="person-circle-outline" size={40} color="#ccc" />
        <View style={styles.postAuthorInfo}>
          <View style={styles.authorNameContainer}>
            <Text style={styles.authorName}>{item.user?.full_name}</Text>
            {item.user_id === currentUserId && (
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
          <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.postFooter}>
        <View style={styles.postStats}>
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => handleAddReaction(item.id, '👍')}
          >
            <Ionicons 
              name={item.reactions?.some(r => r.content === '👍') ? "thumbs-up" : "thumbs-up-outline"}
              size={20} 
              color={item.reactions?.some(r => r.content === '👍') ? "#4A6FFF" : "#666"}
            />
            <Text style={styles.statText}>{item.reactions?.length || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => handleComment(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.statText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {item.comments && renderComments(item.comments, item.id)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Group Feed</Text>
        </View>

        <ScrollView style={styles.feed}>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            feedItems.map(renderPost)
          )}
          {revealedSecrets.map(secret => (
            <View key={secret.id}>
              <Text>Secret revealed: {secret.content}</Text>
              <Text>By user: {secret.user_id}</Text>
              <Text>At: {secret.revealed_at}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write something..."
            value={newPost}
            onChangeText={setNewPost}
            multiline
          />
          <TouchableOpacity 
            style={styles.postButton}
            onPress={handlePost}
            disabled={!newPost.trim()}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <PatientBottomNav activeTab="Home" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollView: { flex: 1 },
  header: {
    backgroundColor: '#4A6FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 6,
    marginRight: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  feed: {
    flex: 1,
    padding: 16,
  },
  post: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  postAuthorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  postStats: {
    flexDirection: 'row',
    gap: 16,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
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
  replyBtn: {
    color: '#6B5ECD',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  sendCommentButton: {
    padding: 8,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
  },
  replyingToText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cancelReply: {
    color: '#6B5ECD',
    fontWeight: 'bold',
    fontSize: 12,
  },
  commentInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  commentContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#4A6FFF',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
});

export default PatientGroup; 