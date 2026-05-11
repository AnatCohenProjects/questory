'use client';

import { useState } from 'react';
import { DataSource } from '@/types/builder';
import ManualSourceForm from './ManualSourceForm';

interface DataSourceSelectorProps {
  current?: DataSource;
  onSelect: (source: DataSource) => void;
}

export default function DataSourceSelector({ current, onSelect }: DataSourceSelectorProps) {
  const [mode, setMode] = useState<'manual' | 'db' | null>(current?.type === 'manual' ? 'manual' : null);

  const card = 'space-y-5 bg-[#131313] border border-[#3a4a49]/30 rounded-2xl p-6';
  const lbl = 'block text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2';

  if (!mode) {
    return (
      <div className={card}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60 mb-1">בחרו מקור נתונים</p>
          <p className="text-xs text-[#e5e2e1]/30 mb-4">איפה להשיג את הנתונים לחידה?</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('manual')}
            className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-[#3a4a49]/40 bg-[#0a0a0a] text-[#e5e2e1]/60 hover:border-[#3a4a49]/80 hover:text-[#e5e2e1] transition-colors text-right"
          >
            <span className="text-xl">📝</span>
            <span className="text-sm font-semibold">הזנה ידנית</span>
            <span className="text-[10px] text-[#e5e2e1]/40">הקלידו טקסט חופשי</span>
          </button>

          <button
            onClick={() => setMode('db')}
            className="flex flex-col items-start gap-1.5 p-4 rounded-xl border border-[#3a4a49]/40 bg-[#0a0a0a] text-[#e5e2e1]/60 hover:border-[#3a4a49]/80 hover:text-[#e5e2e1] transition-colors text-right"
          >
            <span className="text-xl">🗄️</span>
            <span className="text-sm font-semibold">בסיס נתונים</span>
            <span className="text-[10px] text-[#e5e2e1]/40">בחרו מקטלוג</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#00FBFB]/60">
          {mode === 'manual' ? '📝 הזנה ידנית' : '🗄️ בסיס נתונים'}
        </p>
        <button
          onClick={() => setMode(null)}
          className="text-[#e5e2e1]/30 text-xs hover:text-[#00FBFB] transition-colors"
        >
          שנה מקור
        </button>
      </div>

      {mode === 'manual' && (
        <ManualSourceForm
          current={current?.type === 'manual' ? current : undefined}
          onSubmit={onSelect}
        />
      )}

      {mode === 'db' && (
        <div className="bg-[#0a0a0a] border border-dashed border-[#3a4a49]/40 rounded-xl p-6 text-center space-y-3">
          <p className="text-sm text-[#e5e2e1]/60">
            🚧 בסיס נתונים טרם מיושם
          </p>
          <p className="text-[10px] text-[#e5e2e1]/40">
            בשלב הבא: חיבור ל-IDEA, ספריות מוזיאון וקטלוגים
          </p>
        </div>
      )}
    </div>
  );
}
