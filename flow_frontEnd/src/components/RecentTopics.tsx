import { useState, useEffect } from 'react';
import { progressService } from '@/services/progressService';
import { RecentTopic } from '@/types';
import { PROGRESS_UPDATED_EVENT } from './VideoPlayer';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const RecentTopics = () => {
  const [recentTopics, setRecentTopics] = useState<RecentTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecentTopics = async () => {
      try {
        const { recentActivity } = await progressService.getRecentActivity();
        setRecentTopics(recentActivity || []);
      } catch (error: any) {
        console.error('Failed to fetch recent topics:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentTopics();
    
    // Listen for progress updates with custom event data
    const handleProgressUpdate = () => {
      fetchRecentTopics();
    };
    
    window.addEventListener(PROGRESS_UPDATED_EVENT, handleProgressUpdate);
    
    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleProgressUpdate);
    };
  }, []);

  const handleTopicClick = (roadmapId: string, topicId: string) => {
    navigate(`/roadmap/${roadmapId}/topic/${topicId}`);
    
    // Add some error prevention
    window.addEventListener('unhandledrejection', function(event) {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('404')) {
        toast({
          title: "Topic Not Found",
          description: "This topic may have been deleted or moved.",
          variant: "destructive",
        });
      }
    });
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-4">
      {recentTopics.map((topic, index) => (
        <div 
          key={index} 
          className="flex items-center justify-between p-3 rounded-lg border dark:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          onClick={() => handleTopicClick(topic.roadmapId, topic.topicId)}
        >
          <div>
            <h4 className="font-medium text-black dark:text-white">
              {topic.topicTitle || "Unknown Topic"}
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {topic.roadmapTitle || "Unknown Roadmap"}
            </p>
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {new Date(topic.completedAt).toLocaleDateString()}
          </span>
        </div>
      ))}

      {recentTopics.length === 0 && !error && (
        <div className="text-center p-4 text-zinc-500 dark:text-zinc-400">
          No activity yet. Start completing topics!
        </div>
      )}
    </div>
  );
}; 