import { api } from './api';

export interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  likes: string[];
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

export const commentService = {
  // Get all comments for a topic
  async getComments(roadmapId: string, topicId: string) {
    try {
      const response = await api.get(`/comments/${roadmapId}/${topicId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },
  
  // Add a new comment
  async addComment(roadmapId: string, topicId: string, text: string, parentCommentId?: string) {
    try {
      const response = await api.post(`/comments/${roadmapId}/${topicId}`, {
        text,
        parentCommentId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
  
  // Delete a comment
  async deleteComment(commentId: string) {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
  
  // Like a comment
  async likeComment(commentId: string) {
    try {
      const response = await api.post(`/comments/like/${commentId}`, {});
      return response.data;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }
}; 