import React from "react";

interface ProgressProps {
  value?: number;
  className?: string;
}

export const Progress = ({ value = 0, className = "" }: ProgressProps) => {
  return (
    <div className={`relative h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-zinc-900 dark:bg-zinc-50 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}; 