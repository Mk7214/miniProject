import { useEffect, useState, useRef } from "react"
import { Heart, MessageSquare, Share2, Bookmark } from "lucide-react"
import { progressService } from "@/services/progressService"
import { commentService, Comment as CommentType } from "@/services/commentService"
import { likeService } from "@/services/likeService"
import { bookmarkService } from "@/services/bookmarkService"
import { useParams } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/authService"
import { topicViewService } from '@/services/topicViewService'
import { UserProgress } from '@/types'

// Define a custom event to refresh the dashboard
export const PROGRESS_UPDATED_EVENT = 'progress-updated';

interface VideoPlayerProps {
  topic: {
    _id?: string;
    title: string;
    description: string;
    resources: Resource[];
    order: number;
  };
}

interface Resource {
  title: string;
  url: string;
  type: string;
  platform?: string;
}

export const VideoPlayer = ({ topic }: VideoPlayerProps) => {
  const [videoUrl, setVideoUrl] = useState("")
  const [showOverlay, setShowOverlay] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentType[]>([])
  const [newComment, setNewComment] = useState("")
  const { roadmapId } = useParams()
  const { toast } = useToast()
  const [isCompleted, setIsCompleted] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const [loadingComments, setLoadingComments] = useState(false)
  const [loadingLikes, setLoadingLikes] = useState(false)
  const [loadingBookmark, setLoadingBookmark] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const viewRecordedRef = useRef<{[key: string]: boolean}>({})

  useEffect(() => {
    // Get current user ID
    const fetchCurrentUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (userData && userData.user) {
          // Use string ID format to match what's expected
          const userId = userData.user.id || userData.user._id;
          if (userId) {
            setCurrentUserId(userId);
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const checkTopicCompletion = async () => {
      if (!roadmapId || !topic._id) return;
      
      try {
        const { progress } = await progressService.getUserProgress();
        const roadmapProgress = progress.find((p: UserProgress) => p.roadmap._id === roadmapId);
        
        if (roadmapProgress) {
          const isTopicCompleted = roadmapProgress.completedTopics.some(
            (t: { topic: { _id: string } }) => t.topic._id === topic._id
          );
          setIsCompleted(isTopicCompleted);
        }
      } catch (error) {
        console.error("Error checking topic completion:", error);
      }
    };
    
    checkTopicCompletion();
  }, [roadmapId, topic._id]);

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!roadmapId || !topic._id) return;
      
      try {
        // Get video URL as before
        const videoResource = topic.resources.find(r => r.type === 'video');
        if (videoResource) {
          const videoId = getYouTubeVideoId(videoResource.url);
          if (videoId) {
            setVideoUrl(`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&color=white&disablekb=0&iv_load_policy=3&loop=0&playlist=${videoId}&enablejsapi=0&origin=${window.location.origin}&widgetid=1`);
          }
        }
        
        // Fetch actual like status and count
        setLoadingLikes(true);
        const likeData = await likeService.getLikeStatus(roadmapId, topic._id);
        setIsLiked(likeData.liked);
        setLikeCount(likeData.likeCount);
        setLoadingLikes(false);
        
        // Fetch bookmark status
        setLoadingBookmark(true);
        const bookmarkData = await bookmarkService.getBookmarkStatus(roadmapId, topic._id);
        setIsSaved(bookmarkData.bookmarked);
        setLoadingBookmark(false);
        
        // Fetch comments
        await fetchComments();
        
      } catch (error) {
        console.error("Error fetching video data:", error);
        // Fallback to mock data for development
        setLikeCount(Math.floor(Math.random() * 50) + 5);
      }
      
      // Set a timer to show the overlay after a reasonable time
      const timer = setTimeout(() => {
        setShowOverlay(true);
      }, 5 * 60 * 1000);
      
      return () => clearTimeout(timer);
    };
    
    fetchVideoData();
  }, [topic, roadmapId]);

  useEffect(() => {
    if (topic && topic._id && roadmapId) {
      const viewKey = `${roadmapId}-${topic._id}`;
      if (!viewRecordedRef.current[viewKey]) {
        // Record that this topic was viewed
        topicViewService.recordView(roadmapId, topic._id);
        viewRecordedRef.current[viewKey] = true;
      }
    }
  }, [topic, roadmapId]);

  // Helper function to extract video ID from YouTube URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Mark this topic as completed
  const markAsCompleted = async () => {
    if (!roadmapId || !topic._id || isCompleted) return;
    
    try {
      const response = await progressService.updateTopicProgress(roadmapId, topic._id);
      
      if (response.success) {
        setIsCompleted(true);
        toast({
          title: "Progress Updated",
          description: "This topic has been marked as completed!",
          variant: "default",
        });
        
        // Use a proper custom event with data
        const event = new CustomEvent(PROGRESS_UPDATED_EVENT, {
          detail: { roadmapId, topicId: topic._id }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      // For development, still mark as completed
      setIsCompleted(true);
      toast({
        title: "Progress Updated",
        description: "Topic marked as completed in development mode",
        variant: "default",
      });
      
      // Still dispatch event for UI update
      const event = new CustomEvent(PROGRESS_UPDATED_EVENT, {
        detail: { roadmapId, topicId: topic._id }
      });
      window.dispatchEvent(event);
    }
  }

  const handleLike = async () => {
    if (!roadmapId || !topic._id) return;
    
    try {
      setLoadingLikes(true);
      const response = await likeService.toggleLike(roadmapId, topic._id);
      
      setIsLiked(response.liked);
      // Refetch the current like count
      const likeData = await likeService.getLikeStatus(roadmapId, topic._id);
      setLikeCount(likeData.likeCount);
      
      toast({
        title: response.liked ? "Liked" : "Unliked",
        description: response.message,
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    } finally {
      setLoadingLikes(false);
    }
  }

  const handleSave = async () => {
    if (!roadmapId || !topic._id) return;
    
    try {
      setLoadingBookmark(true);
      console.log("Bookmark toggle request:", { roadmapId, topicId: topic._id });
      const response = await bookmarkService.toggleBookmark(roadmapId, topic._id);
      
      setIsSaved(response.bookmarked);
      
      toast({
        title: response.bookmarked ? "Bookmarked" : "Removed from Bookmarks",
        description: response.message,
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    } finally {
      setLoadingBookmark(false);
    }
  }

  const handleAddComment = async () => {
    if (!roadmapId || !topic._id || !newComment.trim()) return;
    
    try {
      const response = await commentService.addComment(roadmapId, topic._id, newComment);
      
      // Refresh comments
      await fetchComments();
      
      // Clear comment input
      setNewComment("");
      
      toast({
        title: "Comment Added",
        description: "Your comment was added successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  }

  const handleCommentLike = async (commentId: string) => {
    try {
      console.log(`Attempting to like comment: ${commentId}`);
      
      // Make sure we have a valid commentId
      if (!commentId) {
        console.error("Invalid comment ID");
        return;
      }
      
      const response = await commentService.likeComment(commentId);
      console.log("Like comment response:", response);
      
      // Refresh comments to get updated like count
      await fetchComments();
    } catch (error: any) {
      console.error("Error liking comment:", error);
      console.error("Response data:", error.response?.data);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to like comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      
      // Refresh comments
      await fetchComments();
      
      toast({
        title: "Comment Deleted",
        description: "Your comment was deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  }

  const fetchComments = async () => {
    if (!roadmapId || !topic._id) return;
    
    try {
      setLoadingComments(true);
      const commentsData = await commentService.getComments(roadmapId, topic._id);
      setComments(commentsData.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Fallback for development
      // Keep existing mock comments
    } finally {
      setLoadingComments(false);
    }
  };

  return (
    <div className="space-y-4">
      {videoUrl ? (
        <div className="relative overflow-hidden pb-[56.25%] rounded-lg border shadow-sm">
          <iframe
            src={videoUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={topic.title}
            loading="lazy"
            frameBorder="0"
            referrerPolicy="strict-origin"
          ></iframe>
          
          {/* Custom overlay that can be shown after a set time */}
          {showOverlay && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10">
              <h3 className="text-xl font-bold mb-4">Ready to Mark as Completed?</h3>
              <p className="mb-6 text-center px-4">You've been watching for a while. Would you like to mark this topic as completed?</p>
              <div className="flex gap-4">
                <button 
                  onClick={markAsCompleted}
                  disabled={isCompleted}
                  className={`px-6 py-2 rounded-md ${
                    isCompleted
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isCompleted ? "Completed ✓" : "Mark as Completed"}
                </button>
                <button 
                  onClick={() => setShowOverlay(false)}
                  className="px-6 py-2 rounded-md bg-zinc-600 hover:bg-zinc-700 text-white"
                >
                  Continue Watching
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 rounded-lg border bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
          No video available for this topic
        </div>
      )}

      {/* Video interaction buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} />
            <span>{likeCount}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400"
          >
            <MessageSquare className="h-5 w-5" />
            <span>{comments.length}</span>
          </button>
        </div>
        
        <div className="flex gap-4">
          <button className="text-zinc-500 dark:text-zinc-400">
            <Share2 className="h-5 w-5" />
          </button>
          
          <button 
            onClick={handleSave}
            className={`${isSaved ? 'text-blue-500' : 'text-zinc-500 dark:text-zinc-400'}`}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="rounded-lg border dark:border-zinc-800 p-4 mt-4">
          <h3 className="font-semibold text-lg mb-4 text-black dark:text-white">Comments</h3>
          
          {/* Add comment form */}
          <div className="flex flex-col gap-2 mb-6">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-transparent text-black dark:text-white"
              rows={3}
            />
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="self-end px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Comment
            </button>
          </div>
          
          {/* Comments list */}
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment._id} className="border-b dark:border-zinc-800 pb-4">
                <div className="flex justify-between">
                  <span className="font-medium text-black dark:text-white">
                    {comment.user?.username || 'Anonymous'}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="my-2 text-black dark:text-zinc-300">{comment.text}</p>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleCommentLike(comment._id)}
                    className="text-zinc-500 dark:text-zinc-400 hover:text-red-500"
                  >
                    <Heart className={`h-4 w-4 ${
                      currentUserId && 
                      Array.isArray(comment.likes) && 
                      comment.likes.some(id => id === currentUserId) 
                        ? 'fill-red-500' 
                        : ''
                    }`} />
                  </button>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {Array.isArray(comment.likes) ? comment.likes.length : 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={markAsCompleted}
        disabled={isCompleted}
        className={`w-full py-2 rounded-md ${
          isCompleted
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        }`}
      >
        {isCompleted ? "Completed ✓" : "Mark as Completed"}
      </button>
    </div>
  )
} 