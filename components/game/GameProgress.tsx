'use client';

interface GameProgressProps {
  totalStations: number;
  currentStationId: number;
  completedCount: number;
}

export default function GameProgress({ totalStations, currentStationId, completedCount }: GameProgressProps) {
  return (
    <div className="flex items-center gap-2 justify-center py-3" dir="rtl">
      {Array.from({ length: totalStations }).map((_, i) => {
        const isCompleted = i < completedCount;
        const isCurrent = i === currentStationId;

        return (
          <div key={i} className="flex items-center">
            <div
              className={`rounded-full transition-all ${
                isCompleted
                  ? 'w-4 h-4 bg-amber-400'
                  : isCurrent
                  ? 'w-5 h-5 bg-amber-400 ring-4 ring-amber-400/30'
                  : 'w-3 h-3 bg-gray-700'
              }`}
            />
            {i < totalStations - 1 && (
              <div className={`h-0.5 w-6 mx-1 ${i < completedCount ? 'bg-amber-400' : 'bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
