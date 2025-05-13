import { supabase } from '../../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { withRetry, withOfflineSupport } from '../utils/retryUtils';
import { compressImage } from '../utils/imageCompression';

export type FeedItemType = 'task_completion' | 'task_miss' | 'comment' | 'reaction';

export interface FeedItem {
  id: string;
  group_id: string;
  user_id: string;
  type: FeedItemType;
  content: string;
  task_id?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  user?: {
    full_name: string;
    profile_photo?: string;
    role: string;
  };
  comments?: FeedItem[];
  reactions?: FeedItem[];
  likes?: number;
  hasLiked?: boolean;
  commentSection?: {
    isOpen: boolean;
    comments: FeedItem[];
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

export const groupFeedService = {
  // Get feed items for a group with pagination
  async getFeedItems(
    groupId: string,
    pageSize: number = 10,
    cursor?: string
  ): Promise<PaginatedResponse<FeedItem>> {
    return withOfflineSupport(
      () =>
        withRetry(async () => {
          const query = supabase
        .from('group_feed')
        .select(`
          *,
          user:user_id (
            full_name,
            profile_photo,
            role
          )
        `)
        .eq('group_id', groupId)
            .order('created_at', { ascending: false })
            .limit(pageSize + 1);

          if (cursor) {
            query.lt('created_at', cursor);
          }

          const { data, error } = await query;

      if (error) throw error;

          const hasMore = data.length > pageSize;
          const items = data.slice(0, pageSize);

          return {
            data: items,
            hasMore,
            nextCursor: hasMore ? items[items.length - 1].created_at : null,
          };
        }),
      `feed_${groupId}`,
      { ttl: 5 * 60 * 1000 } // 5 minutes cache
    );
  },

  // Subscribe to real-time updates
  subscribeToFeed(
    groupId: string,
    onUpdate: (payload: any) => void
  ): any {
    return (supabase as any)
      .channel(`group_feed:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_feed',
          filter: `group_id=eq.${groupId}`,
        },
        onUpdate
      )
      .subscribe();
  },

  // Add a new feed item with media support
  async addFeedItem(
    groupId: string,
    userId: string,
    type: FeedItemType,
    content: string,
    taskId?: string,
    parentId?: string,
    mediaFile?: { uri: string; type: string }
  ): Promise<FeedItem> {
    return withRetry(async () => {
      let mediaUrl: string | null = null;
      let mediaType: 'image' | 'video' | null = null;

      if (mediaFile) {
        // Compress image before upload
        const compressedUri = await compressImage(mediaFile.uri);
        
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const filePath = `${groupId}/${fileName}`;

        // Convert URI to Blob
        const response = await fetch(compressedUri);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('group_feed_media')
          .upload(filePath, blob);

        if (uploadError) throw uploadError;

        mediaUrl = filePath;
        mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
      }

      const { data, error } = await supabase
        .from('group_feed')
        .insert({
          group_id: groupId,
          user_id: userId,
          type,
          content,
          task_id: taskId,
          parent_id: parentId,
          media_url: mediaUrl,
          media_type: mediaType,
        })
        .select(`
          *,
          user:user_id (
            full_name,
            profile_photo,
            role
          )
        `)
        .single();

      if (error) throw error;
      return data;
    });
  },

  // Update a feed item
  async updateFeedItem(
    itemId: string,
    content: string
  ): Promise<FeedItem> {
    try {
      const { data, error } = await supabase
        .from('group_feed')
        .update({ content })
        .eq('id', itemId)
        .select(`
          *,
          user:user_id (
            full_name,
            profile_photo,
            role
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating feed item:', error);
      throw error;
    }
  },

  // Delete a feed item
  async deleteFeedItem(itemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('group_feed')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting feed item:', error);
      throw error;
    }
  },

  // Get comments for a feed item
  async getComments(parentId: string): Promise<FeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('group_feed')
        .select(`
          *,
          user:user_id (
            full_name,
            profile_photo,
            role
          )
        `)
        .eq('parent_id', parentId)
        .eq('type', 'comment')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Add a comment to a feed item
  async addComment(
    groupId: string,
    userId: string,
    parentId: string,
    content: string
  ): Promise<FeedItem> {
    return this.addFeedItem(groupId, userId, 'comment' as FeedItemType, content, undefined, parentId);
  },

  // Add a reaction to a feed item
  async addReaction(
    groupId: string,
    userId: string,
    parentId: string,
    content: string
  ): Promise<FeedItem> {
    return this.addFeedItem(groupId, userId, 'reaction' as FeedItemType, content, undefined, parentId);
  },

  // Get reactions for a feed item
  async getReactions(parentId: string): Promise<FeedItem[]> {
    try {
      const { data, error } = await supabase
        .from('group_feed')
        .select(`
          *,
          user:user_id (
            full_name,
            profile_photo,
            role
          )
        `)
        .eq('parent_id', parentId)
        .eq('type', 'reaction')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reactions:', error);
      throw error;
    }
  },

  // Get media URL
  getMediaUrl(path: string): string {
    const { data } = supabase.storage.from('group_feed_media').getPublicUrl(path);
    return data?.publicURL || '';
  },

  // Delete media file
  async deleteMedia(path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('group_feed_media')
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  },
}; 