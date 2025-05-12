import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockReveal = {
  user: {
    name: 'Emma Davies',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  missedTask: 'Evening Medication',
  secret: '"I tell everyone I\'m allergic to seafood, but I actually just hate the taste. I\'ve been faking this allergy for over 10 years now!"',
  revealedAgo: '1 hour ago',
  likes: 3,
  comments: 1,
  commentList: [
    {
      user: {
        name: 'Deen Rufus',
        avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
      },
      time: '45 minutes ago',
      text: "Emma! All those seafood dinners we skipped for you! 😂 I can't believe you've been lying to us all this time!",
    },
  ],
};

const SecretRevealsPlayer = () => {
  const [comment, setComment] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secret Revealed!</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.content}>
          <View style={styles.lockCircle}>
            <Ionicons name="lock-closed" size={48} color="#6B5ECD" />
          </View>
          <Text style={styles.mainText}>Emma missed a task and a secret was revealed!</Text>
          <View style={styles.secretCard}>
            <View style={styles.secretCardHeader}>
              <Image source={{ uri: mockReveal.user.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.secretUser}>{mockReveal.user.name}</Text>
                <Text style={styles.secretTask}>Missed: {mockReveal.missedTask}</Text>
              </View>
            </View>
            <View style={styles.secretTextBox}>
              <Text style={styles.secretText}>{mockReveal.secret}</Text>
            </View>
            <View style={styles.secretMetaRow}>
              <Text style={styles.secretMeta}>{`Revealed ${mockReveal.revealedAgo}`}</Text>
              <View style={styles.secretMetaIcons}>
                <Ionicons name="thumbs-up-outline" size={18} color="#888" style={{ marginRight: 4 }} />
                <Text style={styles.secretMeta}>{mockReveal.likes}</Text>
                <Ionicons name="chatbubble-outline" size={18} color="#888" style={{ marginLeft: 12, marginRight: 4 }} />
                <Text style={styles.secretMeta}>{mockReveal.comments}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.commentsTitle}>Comments</Text>
          <View style={styles.commentCard}>
            <Image source={{ uri: mockReveal.commentList[0].user.avatar }} style={styles.commentAvatar} />
            <View style={styles.commentContent}>
              <Text style={styles.commentUser}>{mockReveal.commentList[0].user.name}</Text>
              <Text style={styles.commentTime}>{mockReveal.commentList[0].time}</Text>
              <Text style={styles.commentText}>{mockReveal.commentList[0].text}</Text>
            </View>
          </View>
          <View style={styles.addCommentRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={styles.sendBtn}>
              <Ionicons name="send" size={22} color="#6B5ECD" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footerBtns}>
          <TouchableOpacity style={styles.supportBtn}>
            <Ionicons name="thumbs-up-outline" size={22} color="#6B5ECD" />
            <Text style={styles.supportBtnText}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentBtn}>
            <Ionicons name="chatbubble-outline" size={22} color="#fff" />
            <Text style={styles.commentBtnText}>Comment</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    backgroundColor: '#6B5ECD',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 32,
    zIndex: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  lockCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E5DEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -45,
    marginBottom: 18,
  },
  mainText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 18,
  },
  secretCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  secretCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  secretUser: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  secretTask: {
    color: '#888',
    fontSize: 13,
  },
  secretTextBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  secretText: {
    color: '#6B5ECD',
    fontSize: 15,
    fontStyle: 'italic',
  },
  secretMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secretMeta: {
    color: '#888',
    fontSize: 13,
  },
  secretMetaIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  commentCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  commentTime: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 15,
    color: '#222',
  },
  addCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#F5F6FA',
    borderRadius: 8,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#E5DEFF',
    borderRadius: 8,
    padding: 8,
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5DEFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  supportBtnText: {
    color: '#6B5ECD',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B5ECD',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  commentBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default SecretRevealsPlayer; 