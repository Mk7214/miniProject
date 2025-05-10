import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressService } from '@/services/progressService';
import { UserProgress } from '@/types';

// Simple progress bar component (no dependencies)
const ProgressBar = ({ value }: { value: number }) => (
  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
    <div 
      className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all" 
      style={{ width: `${value}%` }}
    />
  </div>
);

export const ActiveRoadmaps = () => {
  const [roadmaps, setRoadmaps] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const { progress } = await progressService.getUserProgress();
        setRoadmaps(progress || []);
      } catch (error: any) {
        console.error('Failed to fetch roadmaps:', error);
        setError(error.message);
        // Fallback data for development
        setRoadmaps([{
          roadmap: { _id: '1', title: 'Web Development' },
          completedTopics: [{
            topic: { _id: '101', title: 'HTML Basics' },
            completedAt: new Date().toISOString()
          }],
          percentageComplete: 35,
          lastAccessedAt: new Date().toISOString()
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      ))}
    </div>;
  }

  return (
    <div className="space-y-4">
      {roadmaps.map((roadmap) => (
        <div
          key={roadmap.roadmap._id}
          className="p-4 rounded-lg border dark:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
          onClick={() => navigate(`/roadmap/${roadmap.roadmap._id}`)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-black dark:text-white">{roadmap.roadmap.title}</h3>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {Math.round(roadmap.percentageComplete)}% Complete
            </span>
          </div>
          <ProgressBar value={roadmap.percentageComplete} />
        </div>
      ))}

      {roadmaps.length === 0 && !error && (
        <div className="text-center p-4 text-zinc-500 dark:text-zinc-400">
          No active roadmaps found. Start learning something new!
        </div>
      )}

      {error && (
        <div className="text-center p-4 text-red-500">
          Error loading roadmaps: {error}
        </div>
      )}
    </div>
  );
}; 