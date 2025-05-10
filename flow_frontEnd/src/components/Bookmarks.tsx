import { useEffect, useState } from "react";
import { bookmarkService, Bookmark } from "@/services/bookmarkService";
import { Link } from "react-router-dom";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        // Debug first
        await bookmarkService.debugBookmarks();
        const response = await bookmarkService.getUserBookmarks();
        console.log("Bookmarks response:", response);
        setBookmarks(response.bookmarks || []);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        toast({
          title: "Error",
          description: "Failed to load your bookmarks",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [toast]);

  const handleRemoveBookmark = async (roadmapId: string, topicId: string) => {
    try {
      await bookmarkService.toggleBookmark(roadmapId, topicId);
      
      // Remove from local state
      setBookmarks(bookmarks.filter(b => 
        !(b.roadmap._id === roadmapId && b.topic._id === topicId)
      ));
      
      toast({
        title: "Bookmark Removed",
        description: "Topic removed from your bookmarks",
        variant: "default",
      });
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-10">
        <BookmarkIcon className="mx-auto h-10 w-10 text-zinc-400 mb-4" />
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No bookmarks yet</h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Save topics you want to revisit later by clicking the bookmark icon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-black dark:text-white">Your Bookmarks</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => (
          bookmark.topic && bookmark.roadmap ? (
            <div 
              key={`${bookmark.roadmap._id}-${bookmark.topic._id}`} 
              className="border rounded-lg p-4 shadow-sm dark:border-zinc-800 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between">
                <h3 className="font-medium text-black dark:text-white">
                  {bookmark.topic.title}
                </h3>
                <button 
                  onClick={() => handleRemoveBookmark(bookmark.roadmap._id, bookmark.topic._id)}
                  className="text-zinc-400 hover:text-red-500"
                >
                  <BookmarkIcon className="h-5 w-5 fill-blue-500" />
                </button>
              </div>
              
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                {bookmark.topic.description}
              </p>
              
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  From: {bookmark.roadmap.title}
                </span>
                
                <Link 
                  to={`/roadmap/${bookmark.roadmap._id}/topic/${bookmark.topic._id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Open Topic →
                </Link>
              </div>
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
}; 