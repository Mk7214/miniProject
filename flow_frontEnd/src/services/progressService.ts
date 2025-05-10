import { api } from "./api";

export const progressService = {
  async getUserProgress() {
    try {
      const response = await api.get("/progress/user-progress");
      return response.data;
    } catch (error) {
      console.error("Error fetching user progress:", error);
      throw error;
    }
  },

  async updateTopicProgress(roadmapId: string, topicId: string) {
    try {
      const response = await api.post("/progress/update-progress", {
        roadmapId,
        topicId,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  },

  async getRecentActivity() {
    try {
      const response = await api.get("/progress/recent-activity");
      return response.data;
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }
  },
};

