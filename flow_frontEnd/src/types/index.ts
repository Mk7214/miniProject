export interface UserProgress {
    roadmap: {
        _id: string;
        title: string;
    };
    completedTopics: {
        topic: {
            _id: string;
            title: string;
        };
        completedAt: string;
    }[];
    percentageComplete: number;
    lastAccessedAt: string;
}

export interface RecentTopic {
    topicId: string;
    topicTitle: string;
    roadmapId: string;
    roadmapTitle: string;
    completedAt: string;
} 