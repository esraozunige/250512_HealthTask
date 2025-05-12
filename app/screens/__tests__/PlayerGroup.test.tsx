import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PlayerGroup } from '../PlayerGroup';
import { groupFeedService } from '../../services/groupFeedService';
import { useAuth } from '../../context/AuthContext';

// Mock dependencies
jest.mock('../../services/groupFeedService');
jest.mock('../../context/AuthContext');
jest.mock('expo-image-picker');
jest.mock('expo-av');

describe('PlayerGroup', () => {
  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
  };

  const mockFeedItems = [
    {
      id: '1',
      content: 'Test post',
      user_id: 'user1',
      created_at: new Date().toISOString(),
      type: 'comment',
    },
  ];

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      session: { user: mockUser },
    });

    (groupFeedService.getFeedItems as jest.Mock).mockResolvedValue(mockFeedItems);
  });

  it('renders feed items correctly', async () => {
    const { getByText } = render(<PlayerGroup groupId="group1" />);

    await waitFor(() => {
      expect(getByText('Test post')).toBeTruthy();
    });
  });

  it('handles pull-to-refresh', async () => {
    const { getByTestId } = render(<PlayerGroup groupId="group1" />);

    const refreshControl = getByTestId('feed-refresh-control');
    fireEvent(refreshControl, 'refresh');

    await waitFor(() => {
      expect(groupFeedService.getFeedItems).toHaveBeenCalledWith('group1', 10, 0);
    });
  });

  it('handles adding a new post', async () => {
    const { getByTestId, getByPlaceholderText } = render(<PlayerGroup groupId="group1" />);

    const input = getByPlaceholderText('Write something...');
    fireEvent.changeText(input, 'New post');

    const postButton = getByTestId('post-button');
    fireEvent.press(postButton);

    await waitFor(() => {
      expect(groupFeedService.addFeedItem).toHaveBeenCalledWith(
        'group1',
        'comment',
        'New post',
        undefined,
        undefined
      );
    });
  });

  it('handles media upload', async () => {
    const { getByTestId } = render(<PlayerGroup groupId="group1" />);

    const mediaButton = getByTestId('media-button');
    fireEvent.press(mediaButton);

    // Mock image picker result
    const mockImage = {
      uri: 'test-image.jpg',
      type: 'image/jpeg',
      name: 'test-image.jpg',
    };

    // Simulate image selection
    const { launchImageLibraryAsync } = require('expo-image-picker');
    launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [mockImage],
    });

    await waitFor(() => {
      expect(groupFeedService.addFeedItem).toHaveBeenCalledWith(
        'group1',
        'comment',
        '',
        undefined,
        expect.any(Object)
      );
    });
  });

  it('handles adding a comment', async () => {
    const { getByTestId, getByPlaceholderText } = render(<PlayerGroup groupId="group1" />);

    const commentInput = getByPlaceholderText('Add a comment...');
    fireEvent.changeText(commentInput, 'Test comment');

    const commentButton = getByTestId('comment-button');
    fireEvent.press(commentButton);

    await waitFor(() => {
      expect(groupFeedService.addComment).toHaveBeenCalledWith(
        'group1',
        '1',
        'Test comment'
      );
    });
  });

  it('handles adding a reaction', async () => {
    const { getByTestId } = render(<PlayerGroup groupId="group1" />);

    const reactionButton = getByTestId('reaction-button');
    fireEvent.press(reactionButton);

    await waitFor(() => {
      expect(groupFeedService.addReaction).toHaveBeenCalledWith(
        'group1',
        '1',
        '👍'
      );
    });
  });

  it('handles error states', async () => {
    (groupFeedService.getFeedItems as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

    const { getByText } = render(<PlayerGroup groupId="group1" />);

    await waitFor(() => {
      expect(getByText('Error loading feed')).toBeTruthy();
    });
  });

  it('handles loading states', async () => {
    (groupFeedService.getFeedItems as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { getByTestId } = render(<PlayerGroup groupId="group1" />);

    expect(getByTestId('loading-skeleton')).toBeTruthy();
  });
}); 