'use client';

import { useState } from 'react';
import { ManualDataSource } from '@/types/builder';

interface ManualSourceFormProps {
  current?: ManualDataSource;
  onSubmit: (source: ManualDataSource) => void;
}

export default function ManualSourceForm({ current, onSubmit }: ManualSourceFormProps) {
  const [title, setTitle] = useState(current?.title || '');
  const [description, setDescription] = useState(current?.description || '');
  const [narrative, setNarrative] = useState(current?.narrative_context || '');
  const [keywords, setKeywords] = useState(current?.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');

  const inp = 'w-full bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-xl px-4 py-3 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors';
  const lbl = 'block text-[10px] uppercase tracking-[0.2em] text-[#e5e2e1]/40 mb-2';

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      alert('נא למלא כותרת ומידע טקסטואלי');
      return;
    }

    onSubmit({
      type: 'manual',
      title: title.trim(),
      description: description.trim(),
      narrative_context: narrative.trim(),
      keywords,
    });
  };


  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className={lbl}>כותרת (עד 80 תווים)</label>
        <input
          className={inp}
          placeholder="דלת העתיקה בפינת הרחוב"
          value={title}
          onChange={e => setTitle(e.target.value.slice(0, 80))}
          maxLength={80}
        />
        <p className="text-[10px] text-[#e5e2e1]/25 mt-1">{title.length}/80</p>
      </div>

      {/* Description */}
      <div>
        <label className={lbl}>מידע טקסטואלי - תיאור פיזי (עד 500 תווים)</label>
        <textarea
          className={inp + ' resize-none'}
          placeholder="בפינת הרחוב יש בית עם וילה זקנה שחורה משנות ה-60. הדלת מצוירת בצבע טיל. יש עליה שלוש סלימים מגולגלים בנחושת עתיקה."
          value={description}
          onChange={e => setDescription(e.target.value.slice(0, 500))}
          maxLength={500}
          rows={4}
        />
        <p className="text-[10px] text-[#e5e2e1]/25 mt-1">{description.length}/500</p>
      </div>

      {/* Narrative Context */}
      <div>
        <label className={lbl}>הקשר סיפורי - רקע היסטורי (עד 300 תווים)</label>
        <textarea
          className={inp + ' resize-none'}
          placeholder="חנות זו שימשה בעבר כסטודיו של אמן מפורסם מהתנועה המודרנית. הדלת נחרתה עם סמלים מתקופת הבנייה."
          value={narrative}
          onChange={e => setNarrative(e.target.value.slice(0, 300))}
          maxLength={300}
          rows={3}
        />
        <p className="text-[10px] text-[#e5e2e1]/25 mt-1">{narrative.length}/300</p>
      </div>

      {/* Keywords */}
      <div>
        <label className={lbl}>מילות מפתח</label>
        <div className="flex gap-2 mb-2">
          <input
            className={inp}
            placeholder="הוסיפו מילת מפתח..."
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword();
              }
            }}
          />
          <button
            onClick={addKeyword}
            className="px-4 py-3 bg-[#00FBFB]/10 border border-[#00FBFB]/30 rounded-xl text-[#00FBFB] text-sm font-semibold hover:border-[#00FBFB]/60 transition-colors shrink-0"
          >
            הוסף
          </button>
        </div>
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-[#1a2a2a] border border-[#00FBFB]/30 rounded-full px-3 py-1 text-sm text-[#e5e2e1]"
              >
                {kw}
                <button
                  onClick={() => removeKeyword(i)}
                  className="text-[#e5e2e1]/40 hover:text-red-400 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl bg-[#00FBFB]/10 border border-[#00FBFB]/30 text-[#00FBFB] text-sm font-semibold hover:border-[#00FBFB]/60 hover:bg-[#00FBFB]/20 transition-colors mt-2"
      >
        💾 שמור מקור נתונים
      </button>
    </div>
  );
}