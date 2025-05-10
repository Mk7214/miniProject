import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Roadmap {
  _id: string;
  title: string;
  description?: string;
  topics: Array<{
    _id: string;
    title: string;
    description?: string;
    order: number;
  }>;
}

interface Topic {
  title: string;
  description: string;
  resources: Resource[];
  order: number;
}

interface Resource {
  type: "video" | "article" | "course";
  title: string;
  url: string;
  platform: string;
}

// Add request interceptor for logging
axios.interceptors.request.use((request) => {
  /* console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data
  });*/
  return request;
});

// Add response interceptor for logging
axios.interceptors.response.use(
  (response) => {
    /* console.log('Response:', {
      status: response.status,
      data: response.data
    });*/
    return response;
  },
  (error) => {
    console.error("Response Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export const roadmapService = {
  async getAllRoadmaps(): Promise<Roadmap[]> {
    try {
      const response = await axios.get(`${API_URL}/roadmaps/populated`);
      return response.data;
    } catch (error) {
      console.error("Error fetching roadmaps:", error);
      throw error;
    }
  },

  async getRoadmapById(id: string): Promise<Roadmap> {
    const response = await axios.get(`${API_URL}/roadmaps/${id}`);
    return response.data;
  },

  async getTopic(
    roadmapId: string,
    topicIndex: number | string,
  ): Promise<Topic> {
    const response = await axios.get(
      `${API_URL}/roadmaps/${roadmapId}/topics/${topicIndex}`,
    );
    return response.data;
  },
};
