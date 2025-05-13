import React, { useState, useRef, useEffect } from 'react';
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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import DoctorBottomNav from '../components/DoctorBottomNav';
import * as ImagePicker from 'expo-image-picker';
import { rewriteWithGemini } from '../lib/gemini';
import { groupFeedService, FeedItem } from '../services/groupFeedService';
import { supabase } from '../../lib/supabase';

// Add types for group members and posts
interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  streak: number;
  rank: number;
}

// Add Comment interface for nested replies, likes, and hasLiked
interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes?: number;
  hasLiked?: boolean;
  replies?: Comment[];
}

// Update Post interface to use Comment[]
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
}

// Mock patients (each patient = group)
const mockPatients: {
  id: string;
  name: string;
  image: string;
  status: string;
  streak: number;
  lastActivity: string;
  tasksStatus: string;
  type: string;
  groupMembers: GroupMember[];
  posts: Post[];
}[] = [
  {
    id: 'PT-0024',
    name: 'Sarah Johnson',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'Needs Attention',
    streak: 3,
    lastActivity: '3 days',
    tasksStatus: '2 missed',
    type: 'active',
    groupMembers: [
      { id: '1', name: 'Sarah Johnson', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', role: 'Patient', streak: 3, rank: 1 },
      { id: '2', name: 'Alex Coral', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'Player', streak: 2, rank: 2 },
      { id: '3', name: 'Emily Chen', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', role: 'Player', streak: 1, rank: 3 },
    ],
    posts: [
      {
        id: '1',
        author: { name: 'Sarah Johnson' },
        content: 'Completed my walk today! Feeling good.',
        timestamp: '1 hour ago',
        type: 'task',
        taskName: 'Daily Walk',
        likes: 2,
        comments: 1,
        hasLiked: false,
        commentSection: {
          isOpen: false,
          comments: [
            { id: 'c1', author: 'Alex Coral', content: 'Great job Sarah!', timestamp: '45 min ago' },
          ],
        },
      },
      {
        id: '2',
        author: { name: 'Dr. Camilla Johnson', isDoctor: true },
        content: 'Keep up the good work, team! Remember to log your meals.',
        timestamp: '2 hours ago',
        type: 'update',
        likes: 1,
        comments: 0,
        hasLiked: false,
        commentSection: { isOpen: false, comments: [] },
      },
    ],
  },
  {
    id: 'PT-0031',
    name: 'Michael Chen',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Good',
    streak: 28,
    lastActivity: '28 days',
    tasksStatus: 'All complete',
    type: 'active',
    groupMembers: [
      { id: '1', name: 'Michael Chen', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'Patient', streak: 28, rank: 1 },
      { id: '2', name: 'Jane Lee', avatar: 'https://randomuser.me/api/portraits/women/66.jpg', role: 'Player', streak: 10, rank: 2 },
    ],
    posts: [],
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorGroup'>;

const DoctorGroup = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ postId: string; commentId?: string; author?: string } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const postRefs = useRef<{ [postId: string]: View | null }>({});
  const group = mockPatients[selectedGroupIdx];
  const [posts, setPosts] = useState<Post[]>(group.posts);
  const [newPost, setNewPost] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputBarHeight = 56; // Approximate height of the comment input bar
  const currentUser = { name: 'Dr. Camilla Johnson' };
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
  const [groupId, setGroupId] = useState<string>(''); // You'll need to get this from your group context or params

  useEffect(() => {
    const onKeyboardShow = (e: any) => setKeyboardHeight(e.endCoordinates.height);
    const onKeyboardHide = () => setKeyboardHeight(0);
    const showSub = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onKeyboardHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // When switching groups, update posts state
  React.useEffect(() => {
    setPosts(mockPatients[selectedGroupIdx].posts);
  }, [selectedGroupIdx]);

  useEffect(() => {
    fetchFeedItems();
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

  const handlePost = async () => {
    if (!newPost.trim() && !newPostImage) return;

    try {
      const newItem = await groupFeedService.addFeedItem(
        groupId,
        'comment',
        newPost.trim()
      );
      setFeedItems([newItem, ...feedItems]);
      setNewPost('');
      setNewPostImage(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to post message');
    }
  };

  const handleDeleteFeedItem = async (itemId: string) => {
    try {
      await groupFeedService.deleteFeedItem(itemId);
      setFeedItems(feedItems.filter(item => item.id !== itemId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const handleEditFeedItem = async (itemId: string, newContent: string) => {
    try {
      const updatedItem = await groupFeedService.updateFeedItem(itemId, newContent);
      setFeedItems(feedItems.map(item => 
        item.id === itemId ? updatedItem : item
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update post');
    }
  };

  const handleAddComment = async (parentId: string) => {
    if (!newComment.trim()) return;
    
    try {
      const newCommentItem = await groupFeedService.addComment(groupId, parentId, newComment.trim());
      setFeedItems(feedItems.map(item => 
        item.id === parentId 
          ? { ...item, comments: [...(item.comments || []), newCommentItem] }
          : item
      ));
      setNewComment(''); // Clear the input after successful submission
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleAddReaction = async (parentId: string) => {
    try {
      const newReaction = await groupFeedService.addReaction(groupId, parentId, '👍');
      setFeedItems(feedItems.map(item => 
        item.id === parentId 
          ? { ...item, reactions: [...(item.reactions || []), newReaction] }
          : item
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to add reaction');
    }
  };

  const handleLike = (postId: string) => {
    setPosts(posts => posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.hasLiked ? post.likes - 1 : post.likes + 1,
          hasLiked: !post.hasLiked,
        };
      }
      return post;
    }));
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
            scrollViewRef.current?.scrollTo({ y: Math.max(y - keyboardHeight - inputBarHeight - 24, 0), animated: true });
          }
        );
      }
    }, 350);
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

  // Edit post handlers
  const handleEditPost = (postId: string, content: string) => {
    setEditingPostId(postId);
    setEditingPostText(content);
  };
  const handleSaveEditPost = (postId: string) => {
    setPosts(posts => posts.map(p => p.id === postId ? { ...p, content: editingPostText } : p));
    setEditingPostId(null);
    setEditingPostText('');
  };
  const handleCancelEditPost = () => {
    setEditingPostId(null);
    setEditingPostText('');
  };
  // Delete post handlers
  const handleDeletePost = (postId: string) => {
    setShowDeleteDialog({ postId });
  };
  const confirmDeletePost = () => {
    if (showDeleteDialog) {
      setPosts(posts => posts.filter(p => p.id !== showDeleteDialog.postId));
      setShowDeleteDialog(null);
    }
  };
  const cancelDeletePost = () => {
    setShowDeleteDialog(null);
  };

  // Like/unlike a comment or reply
  const handleLikeComment = (postId: string, commentId: string, parentCommentId?: string) => {
    setPosts(posts => posts.map(post => {
      if (post.id !== postId) return post;
      const updateComments = (comments: Comment[]): Comment[] =>
        comments.map(comment => {
          if (parentCommentId && comment.id === parentCommentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
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
          } else if (comment.replies) {
            return { ...comment, replies: updateComments(comment.replies) };
          }
          return comment;
        });
      return {
        ...post,
        commentSection: {
          isOpen: post.commentSection?.isOpen ?? false,
          comments: updateComments(post.commentSection?.comments || []),
        },
      };
    }));
  };

  // Reply to a comment or reply
  const handleReplyToComment = (postId: string, commentId: string, parentCommentId?: string) => {
    setActiveReply({ postId, commentId });
    setReplyText('');
  };

  const handleSendReply = () => {
    if (!activeReply || !replyText.trim()) return;
    setPosts(posts => posts.map(post => {
      if (post.id !== activeReply.postId) return post;
      const addReply = (comments: Comment[]): Comment[] =>
        comments.map(comment => {
          if (comment.id === activeReply.commentId) {
            const newReply: Comment = {
              id: Date.now().toString(),
              author: currentUser.name,
              content: replyText,
              timestamp: 'Just now',
              likes: 0,
              hasLiked: false,
              replies: [],
            };
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          } else if (comment.replies) {
            return { ...comment, replies: addReply(comment.replies) };
          }
          return comment;
        });
      return {
        ...post,
        commentSection: {
          isOpen: post.commentSection?.isOpen ?? false,
          comments: addReply(post.commentSection?.comments || []),
        },
      };
    }));
    setActiveReply(null);
    setReplyText('');
  };

  // Edit reply handlers
  const handleEditReply = (postId: string, commentId: string, parentId?: string, text = '') => {
    setEditingReply({ postId, commentId, parentId });
    setEditingReplyText(text);
  };
  const handleSaveEditReply = () => {
    if (!editingReply) return;
    setPosts(posts => posts.map(post => {
      if (post.id !== editingReply.postId) return post;
      const updateComments = (comments: Comment[]): Comment[] =>
        comments.map(comment => {
          if (editingReply.parentId && comment.id === editingReply.parentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === editingReply.commentId
                  ? { ...reply, content: editingReplyText }
                  : reply
              ),
            };
          } else if (!editingReply.parentId && comment.id === editingReply.commentId) {
            return { ...comment, content: editingReplyText };
          } else if (comment.replies) {
            return { ...comment, replies: updateComments(comment.replies) };
          }
          return comment;
        });
      return {
        ...post,
        commentSection: {
          isOpen: post.commentSection?.isOpen ?? false,
          comments: updateComments(post.commentSection?.comments || []),
        },
      };
    }));
    setEditingReply(null);
    setEditingReplyText('');
  };
  const handleCancelEditReply = () => {
    setEditingReply(null);
    setEditingReplyText('');
  };

  // Delete reply handlers
  const handleDeleteReply = (postId: string, commentId: string, parentId?: string) => {
    setDeletingReply({ postId, commentId, parentId });
  };
  const confirmDeleteReply = () => {
    if (!deletingReply) return;
    setPosts(posts => posts.map(post => {
      if (post.id !== deletingReply.postId) return post;
      const deleteComment = (comments: Comment[]): Comment[] =>
        comments.filter(comment => {
          if (deletingReply.parentId && comment.id === deletingReply.parentId && comment.replies) {
            comment.replies = comment.replies.filter(reply => reply.id !== deletingReply.commentId);
            return true;
          } else if (!deletingReply.parentId && comment.id === deletingReply.commentId) {
            return false;
          } else if (comment.replies) {
            comment.replies = deleteComment(comment.replies);
          }
          return true;
        });
      return {
        ...post,
        commentSection: {
          isOpen: post.commentSection?.isOpen ?? false,
          comments: deleteComment(post.commentSection?.comments || []),
        },
      };
    }));
    setDeletingReply(null);
  };
  const cancelDeleteReply = () => {
    setDeletingReply(null);
  };

  // Recursive comment rendering
  const renderComments = (comments: Comment[], postId: string, parentId?: string, level = 0) =>
    comments.map(comment => (
      <View key={comment.id} style={[styles.commentItem, { marginLeft: level * 24, marginBottom: 8 }]}> 
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Ionicons name="person-circle-outline" size={22} color="#ccc" style={{ marginRight: 6, marginTop: 2 }} />
          <View style={[styles.commentContent, { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 8, padding: 8 }]}> 
            <Text style={styles.commentAuthor}>{comment.author}</Text>
            {editingReply && editingReply.postId === postId && editingReply.commentId === comment.id && editingReply.parentId === parentId ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <TextInput
                  style={[styles.commentText, { flex: 1, backgroundColor: '#fff', borderRadius: 6, padding: 4, borderWidth: 1, borderColor: '#EEE' }]}
                  value={editingReplyText}
                  onChangeText={setEditingReplyText}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSaveEditReply} style={{ marginLeft: 8 }}>
                  <Text style={{ color: '#4A6FFF', fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelEditReply} style={{ marginLeft: 8 }}>
                  <Text style={{ color: '#888' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.commentText}>{comment.content}</Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
              <TouchableOpacity onPress={() => handleLikeComment(postId, comment.id, parentId)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}>
                <Ionicons name={comment.hasLiked ? 'thumbs-up' : 'thumbs-up-outline'} size={16} color={comment.hasLiked ? '#4A6FFF' : '#888'} />
                <Text style={{ marginLeft: 2, color: '#888', fontSize: 13 }}>{comment.likes || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReplyToComment(postId, comment.id, parentId)} style={{ marginLeft: 16 }}>
                <Text style={styles.replyBtn}>Reply</Text>
              </TouchableOpacity>
              {comment.author === currentUser.name && (!editingReply || editingReply.commentId !== comment.id) && (
                <>
                  <TouchableOpacity onPress={() => handleEditReply(postId, comment.id, parentId, comment.content)} style={{ marginLeft: 16 }}>
                    <Ionicons name="create-outline" size={16} color="#4A6FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteReply(postId, comment.id, parentId)} style={{ marginLeft: 8 }}>
                    <Ionicons name="trash-outline" size={16} color="#E86D6D" />
                  </TouchableOpacity>
                </>
              )}
            </View>
            {activeReply && activeReply.postId === postId && activeReply.commentId === comment.id && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                <TextInput
                  style={[styles.commentInput, { flex: 1, minHeight: 32, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EEE' }]}
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="Write a reply..."
                  autoFocus
                />
                <TouchableOpacity 
                  style={styles.sendCommentButton} 
                  onPress={() => handleAddComment(postId)}
                >
                  <Ionicons name="send" size={20} color="#4A6FFF" />
                </TouchableOpacity>
              </View>
            )}
            {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, postId, comment.id, level + 1)}
          </View>
        </View>
      </View>
    ));

  // Placeholder AI rewrite function for post input
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

  const renderFeedItem = async (item: FeedItem) => {
    const user = await supabase.auth.user();
    if (!user) throw new Error('No user found');
    const isCurrentUser = item.user_id === user?.id;

    return (
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
              <TouchableOpacity onPress={() => handleDeleteFeedItem(item.id)}>
                <Ionicons name="trash" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.feedContent}>{item.content}</Text>
        <View style={styles.interactions}>
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => handleAddReaction(item.id)}
          >
            <Ionicons name="thumbs-up" size={20} color="#666" />
            <Text style={styles.interactionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => handleAddComment(item.id)}
          >
            <Ionicons name="chatbubble" size={20} color="#666" />
            <Text style={styles.interactionText}>Comment</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendCommentButton} 
            onPress={() => handleAddComment(item.id)}
          >
            <Ionicons name="send" size={20} color="#4A6FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Groups</Text>
      </View>
      <View style={styles.tabBar}>
        {mockPatients.map((p, idx) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.tab, idx === selectedGroupIdx && styles.activeTab]}
            onPress={() => setSelectedGroupIdx(idx)}
          >
            <Text style={[styles.tabText, idx === selectedGroupIdx && styles.activeTabText]}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView style={styles.content} ref={scrollViewRef}>
            {/* Wall of Fame */}
            <View style={styles.wallOfFame}>
              <Text style={styles.wallTitle}>Group Wall of Fame</Text>
              <View style={styles.podium}>
                {group.groupMembers.slice(0, 3).map((member, idx) => (
                  <View key={member.id} style={styles.podiumItem}>
                    <Image source={{ uri: member.avatar }} style={styles.avatar} />
                    <View style={styles.rankBadge}><Text style={styles.rankText}>{member.rank}</Text></View>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.streakText}>{member.streak} days</Text>
                  </View>
                ))}
              </View>
            </View>
            {/* Create Post input */}
            <View style={styles.createPost}>
              <Ionicons name="person-circle-outline" size={40} color="#ccc" />
              <View style={styles.postInputContainer}>
                <TextInput
                  style={styles.postInput}
                  placeholder="Share an update with your group..."
                  value={newPost}
                  onChangeText={setNewPost}
                  multiline
                />
                {newPostImage && (
                  <View style={{ marginBottom: 8 }}>
                    <Image source={{ uri: newPostImage }} style={{ width: '100%', height: 150, borderRadius: 8 }} />
                    <TouchableOpacity onPress={() => setNewPostImage(null)} style={{ position: 'absolute', top: 4, right: 4, backgroundColor: '#fff', borderRadius: 12, padding: 2 }}>
                      <Ionicons name="close-circle" size={20} color="#E86D6D" />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.postAction} onPress={handlePickImage}>
                    <Ionicons name="camera" size={24} color="#666" />
                    <Text style={styles.actionText}>Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.aiRewriteButton, isRewritingPost && { opacity: 0.6 }]}
                    onPress={rewritePostWithAI}
                    disabled={isRewritingPost || !newPost.trim()}
                  >
                    <Ionicons name="sparkles-outline" size={20} color="#6B5ECD" />
                    <Text style={styles.aiRewriteText}>Rewrite with AI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginLeft: 'auto', backgroundColor: (newPost.trim() || newPostImage) ? '#4A6FFF' : '#ccc', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 6 }}
                    onPress={handlePost}
                    disabled={!(newPost.trim() || newPostImage)}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* Group Feed */}
            <Text style={styles.feedTitle}>Group Feed</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : (
              feedItems.map(item => renderFeedItem(item))
            )}
          </ScrollView>
          {/* Anchored comment input */}
          {replyTo && (
            <View style={styles.replyIndicator}>
              <Text style={styles.replyingToText}>
                Replying to {replyTo.author ? replyTo.author : 'Post'}
              </Text>
              <TouchableOpacity onPress={() => { setReplyTo(null); setNewComment(''); }}>
                <Text style={styles.cancelReply}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          {showDeleteDialog && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center', width: 280 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Delete Post?</Text>
                <Text style={{ color: '#666', marginBottom: 24, textAlign: 'center' }}>Are you sure you want to delete this post? This action cannot be undone.</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                  <TouchableOpacity onPress={cancelDeletePost} style={{ flex: 1, marginRight: 8, padding: 12, borderRadius: 8, backgroundColor: '#EEE', alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmDeletePost} style={{ flex: 1, marginLeft: 8, padding: 12, borderRadius: 8, backgroundColor: '#E86D6D', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          {deletingReply && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center', width: 280 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Delete Reply?</Text>
                <Text style={{ color: '#666', marginBottom: 24, textAlign: 'center' }}>Are you sure you want to delete this reply? This action cannot be undone.</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                  <TouchableOpacity onPress={cancelDeleteReply} style={{ flex: 1, marginRight: 8, padding: 12, borderRadius: 8, backgroundColor: '#EEE', alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontWeight: 'bold' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmDeleteReply} style={{ flex: 1, marginLeft: 8, padding: 12, borderRadius: 8, backgroundColor: '#E86D6D', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
        <DoctorBottomNav activeTab="Groups" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F6FA' },
  header: { backgroundColor: '#4A6FFF', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 20, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#4A6FFF' },
  tabText: { color: '#888', fontSize: 16 },
  activeTabText: { color: '#4A6FFF', fontWeight: 'bold' },
  content: { flex: 1, padding: 20 },
  wallOfFame: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  wallTitle: { fontWeight: 'bold', fontSize: 18, color: '#222', marginBottom: 10 },
  podium: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  podiumItem: { alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, marginBottom: 4 },
  rankBadge: { backgroundColor: '#E5DEFF', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 2 },
  rankText: { color: '#6B5ECD', fontWeight: 'bold' },
  memberName: { fontWeight: 'bold', fontSize: 14, color: '#222' },
  streakText: { color: '#888', fontSize: 13 },
  feedTitle: { fontWeight: 'bold', fontSize: 16, color: '#222', marginBottom: 8 },
  noPosts: { color: '#888', fontStyle: 'italic', marginBottom: 12 },
  post: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postAuthorInfo: { marginLeft: 10 },
  authorName: { fontWeight: 'bold', fontSize: 15, color: '#222' },
  doctorBadge: { color: '#4A6FFF', fontWeight: 'bold', fontSize: 12, marginLeft: 6 },
  timestamp: { color: '#888', fontSize: 12 },
  taskBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  taskText: { color: '#4CAF50', marginLeft: 6, fontSize: 13 },
  postContent: { fontSize: 15, color: '#222', marginBottom: 8 },
  postFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statButton: { flexDirection: 'row', alignItems: 'center', marginRight: 18 },
  statText: { color: '#666', marginLeft: 4 },
  commentSection: { backgroundColor: '#F5F6FA', borderRadius: 10, padding: 10, marginTop: 8 },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  commentContent: { marginLeft: 8, flex: 1 },
  commentAuthor: { fontWeight: 'bold', fontSize: 14, color: '#222' },
  commentText: { fontSize: 14, color: '#222' },
  commentTimestamp: { color: '#888', fontSize: 11 },
  replyBtn: { color: '#4A6FFF', fontWeight: 'bold', fontSize: 12 },
  replyIndicator: { backgroundColor: '#fff', padding: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
  replyingToText: { color: '#222', fontWeight: 'bold', fontSize: 14, marginBottom: 10 },
  cancelReply: { color: '#4A6FFF', fontWeight: 'bold', fontSize: 12 },
  commentInputBar: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  sendCommentButton: {
    marginLeft: 8,
    backgroundColor: '#E5DEFF',
    borderRadius: 8,
    padding: 8,
  },
  createPost: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
  postInputContainer: { flex: 1, marginLeft: 10 },
  postInput: { flex: 1, fontSize: 14, color: '#222', backgroundColor: '#fff', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: '#EEE' },
  postActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  postAction: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  actionText: { color: '#666', marginLeft: 4 },
  aiRewriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5DEFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  aiRewriteText: {
    color: '#6B5ECD',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
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
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
});

export default DoctorGroup; 