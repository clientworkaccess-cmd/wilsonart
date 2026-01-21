
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isSpeaking: boolean;
  isActive: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isSpeaking, isActive }) => {
  const bars = Array.from({ length: 12 });

  return (
    <div className="flex items-center justify-center gap-1.5 h-32 w-full">
      {bars.map((_, i) => (
        <div
          key={i}
          className={`w-2 rounded-full transition-all duration-300 ${
            isActive 
              ? isSpeaking 
                ? 'bg-blue-400' 
                : 'bg-blue-900/40' 
              : 'bg-gray-800'
          }`}
          style={{
            height: isActive && isSpeaking 
              ? `${Math.max(20, Math.random() * 100)}%` 
              : '10%',
            transition: 'height 0.15s ease-in-out',
            animation: isActive && isSpeaking ? `bounce 0.8s ease-in-out infinite ${i * 0.05}s` : 'none'
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }
      `}</style>
    </div>
  );
};

export default Visualizer;
