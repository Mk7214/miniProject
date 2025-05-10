import { api } from './api';

export const likeService = {
  // Toggle like for a topic
  async toggleLike(roadmapId: string, topicId: string) {
    try {
      const response = await api.post(`/likes/${roadmapId}/${topicId}`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },
  
  // Get like status and count
  async getLikeStatus(roadmapId: string, topicId: string) {
    try {
      const response = await api.get(`/likes/${roadmapId}/${topicId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting like status:', error);
      throw error;
    }
  }
}; 