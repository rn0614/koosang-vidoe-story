// shared/ui/background-grid.tsx
import React from 'react';

interface BackgroundGridProps {
  canvasOffset: { x: number; y: number };
  className?: string;
}

export const BackgroundGrid: React.FC<BackgroundGridProps> = ({ 
  canvasOffset,
  className = "absolute opacity-20"
}) => {
  return (
    <div
      className={className}
      style={{
        left: -canvasOffset.x,
        top: -canvasOffset.y,
        width: '200vw',
        height: '200vh',
      }}
    >
      <svg className="h-full w-full">
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};
