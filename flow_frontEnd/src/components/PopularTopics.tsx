import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { topicViewService, PopularTopic } from '@/services/topicViewService';
import { TrendingUp } from 'lucide-react';

export const PopularTopics = () => {
  const [topics, setTopics] = useState<PopularTopic[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPopularTopics = async () => {
      try {
        setLoading(true);
        const data = await topicViewService.getPopularTopics();
        setTopics(data);
      } catch (error) {
        console.error('Error fetching popular topics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopularTopics();
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
              <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (topics.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-zinc-500 dark:text-zinc-400">No popular topics yet</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {topics.map(topic => (
        <div key={topic._id} className="border dark:border-zinc-700 rounded-lg p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800">
          <div className="flex items-center justify-between">
            <Link 
              to={`/roadmap/${topic.roadmapId}/topic/${topic._id}`} 
              className="text-lg font-medium text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              {topic.title}
            </Link>
            <div className="flex items-center text-green-600 dark:text-green-400 text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {topic.viewCount} views
            </div>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1">
            {topic.description}
          </p>
          <div className="text-xs text-zinc-500 mt-2">
            From: {topic.roadmapTitle}
          </div>
        </div>
      ))}
    </div>
  );
}; 