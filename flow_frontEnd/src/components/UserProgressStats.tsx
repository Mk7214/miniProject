import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { progressService } from '@/services/progressService';
import { UserProgress } from '@/types';
import { PROGRESS_UPDATED_EVENT } from './VideoPlayer';

export const UserProgressStats = () => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { progress } = await progressService.getUserProgress();
      console.log("Fetched progress:", progress);
      setProgress(progress || []);
    } catch (error: any) {
      console.error('Failed to fetch progress:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
    
    // Listen for progress updates with custom event data
    const handleProgressUpdate = (event: Event) => {
      console.log("Progress update event received:", (event as CustomEvent).detail);
      fetchProgress();
    };
    
    window.addEventListener(PROGRESS_UPDATED_EVENT, handleProgressUpdate);
    
    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleProgressUpdate);
    };
  }, []);

  if (loading) {
    return <div className="animate-pulse h-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-4">
        <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Roadmaps</h3>
        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{progress.length}</p>
      </div>
      <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-4">
        <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Topics Completed</h3>
        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
          {progress.reduce((acc, curr) => acc + curr.completedTopics.length, 0)}
        </p>
      </div>
      <div className="rounded-lg bg-purple-100 dark:bg-purple-900/20 p-4">
        <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Average Progress</h3>
        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
          {progress.length > 0
            ? Math.round(
                progress.reduce((acc, curr) => acc + curr.percentageComplete, 0) / progress.length
              )
            : 0}%
        </p>
      </div>
    </div>
  );
}; 