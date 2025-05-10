import { api } from "./api";

export interface Bookmark {
  _id: string;
  topic: {
    _id: string;
    title: string;
    description: string;
  };
  roadmap: {
    _id: string;
    title: string;
  };
  createdAt: string;
}

export const bookmarkService = {
  // Toggle bookmark for a topic
  async toggleBookmark(roadmapId: string, topicId: string) {
    try {
      const response = await api.post(`/bookmarks/${roadmapId}/${topicId}`);
      return response.data;
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      throw error;
    }
  },

  // Get bookmark status
  async getBookmarkStatus(roadmapId: string, topicId: string) {
    try {
      const response = await api.get(`/bookmarks/${roadmapId}/${topicId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting bookmark status:", error);
      throw error;
    }
  },

  // Get all bookmarks for the current user
  async getUserBookmarks() {
    try {
      const response = await api.get("/bookmarks");
      return response.data;
    } catch (error) {
      console.error("Error getting user bookmarks:", error);
      throw error;
    }
  },

  // Add this debug function
  async debugBookmarks() {
    try {
      const response = await api.get("/bookmarks/debug");
      console.log("Debug bookmarks:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error debugging bookmarks:", error);
      throw error;
    }
  },
};

