import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { roadmapService } from "@/services/roadmapService"
import { useToast } from "@/hooks/use-toast"
import { VideoPlayer } from "@/components/VideoPlayer"
import { ReferenceContent } from "@/components/ReferenceContent"

interface Topic {
  title: string;
  description: string;
  resources: Resource[];
  order: number;
}

interface Resource {
  title: string;
  url: string;
  type: string;
}

const TopicPage = () => {
  const { roadmapId, topicIndex } = useParams();
  const { toast } = useToast();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        if (!roadmapId || !topicIndex) {
          throw new Error("Missing roadmap ID or topic index");
        }
        const data = await roadmapService.getTopic(roadmapId, parseInt(topicIndex));
        setTopic(data);
      } catch (error: any) {
        console.error('Failed to fetch topic:', error);
        setError(error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load topic content",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [roadmapId, topicIndex, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-3/4 bg-zinc-700 rounded" />
          <div className="h-4 w-1/2 bg-zinc-700 rounded" />
          <div className="h-96 bg-zinc-700 rounded" />
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Failed to load topic content</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-grey-100 mb-4">{topic.title}</h1>
      <p className="text-zinc-400 mb-8 text-white">{topic.description}</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Video Player Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Video Content</h2>
          <VideoPlayer topic={topic} />
        </div>

        {/* Reference Content Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Reference Material</h2>
          <ReferenceContent resources={topic.resources} />
        </div>
      </div>
    </div>
  );
};

export default TopicPage; 