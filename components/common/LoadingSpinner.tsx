
import React from 'react';

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Analyzing..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center bg-gray-800/50 rounded-lg">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-t-4 border-cyan-400 rounded-full animate-spin"></div>
      </div>
      <p className="text-lg font-semibold text-cyan-300 tracking-wider">{text}</p>
    </div>
  );
};
