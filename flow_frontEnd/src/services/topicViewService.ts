import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface PopularTopic {
  _id: string;
  title: string;
  description: string;
  viewCount: number;
  lastViewed: string;
  roadmapId: string;
  roadmapTitle: string;
}

export const topicViewService = {
  async recordView(roadmapId: string, topicId: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/topic-views/${roadmapId}/${topicId}`);
    } catch (error) {
      console.error("Error recording topic view:", error);
    }
  },

  async getPopularTopics(): Promise<PopularTopic[]> {
    try {
      const response = await axios.get(`${API_URL}/topic-views/popular`);
      return response.data.topics;
    } catch (error) {
      console.error("Error fetching popular topics:", error);
      return [];
    }
  },
};

