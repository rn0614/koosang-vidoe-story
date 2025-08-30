// widgets/workflow/state-explanation.tsx
import { CheckCircle, Circle, Play, XCircle } from 'lucide-react';

export const StateExplanation = () => {
  return (
    <div className="absolute bottom-4 left-4 rounded-lg bg-white px-4 py-2 shadow-md">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 text-yellow-500" />
          <span>대기중</span>
        </div>
        <div className="flex items-center gap-2">
          <Play className="h-3 w-3 text-blue-500" />
          <span>진행중</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3 text-gray-500" />
          <span>완료</span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-3 w-3 text-red-500" />
          <span>실패</span>
        </div>
      </div>
    </div>
  );
};
