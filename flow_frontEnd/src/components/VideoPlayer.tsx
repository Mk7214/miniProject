import { useState } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface VideoPlayerProps {
  topic: {
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
  // Find video resource
  const videoResource = topic.resources.find(resource => resource.type === "video");
  console.log('videoResource', videoResource);

  if (!videoResource) {
    return (
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg p-6 text-center border border-black/70 dark:border-white/20">
        <p className="text-black dark:text-zinc-300">No video content available for this topic</p>
      </div>
    );
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(videoResource.url);
  if (!videoId) {
    return (
      <div className="bg-white dark:bg-zinc-800 text-black dark:text-white rounded-lg p-6 text-center border border-black/70 dark:border-white/20">
        <p className="text-black dark:text-zinc-300">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden border border-black/70 dark:border-white/20">
      <div className="relative w-full pt-[56.25%]">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={videoResource.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="p-4">
        <h3 className="text-black dark:text-white font-semibold">{videoResource.title}</h3>
        {videoResource.platform && (
          <p className="text-black/70 dark:text-zinc-400 text-sm mt-1">Source: {videoResource.platform}</p>
        )}
      </div>
    </div>
  );
}; 