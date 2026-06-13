'use client';

import { useEffect, useState } from 'react';
import { prepareBuilderImageFile, validateBuilderImageValue } from '@/lib/builderImage';

interface ImageUploadProps {
  currentUrl?: string;
  onImageChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ currentUrl, onImageChange, label = 'תמונה' }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState(currentUrl || '');

  useEffect(() => {
    setInputValue(currentUrl || '');
  }, [currentUrl]);

  const commitImageValue = (nextValue: string) => {
    const result = validateBuilderImageValue(nextValue);

    if (!result.ok) {
      setError(result.error);
      if (nextValue.trim().startsWith('data:image/')) {
        setInputValue(currentUrl || '');
      }
      return;
    }

    setError('');
    onImageChange(result.value);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    setLoading(true);
    const result = await prepareBuilderImageFile(file);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    setInputValue(result.value);
    onImageChange(result.value);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (!item.type.startsWith('image/')) {
        continue;
      }

      e.preventDefault();
      const file = item.getAsFile();
      if (!file) return;

      setLoading(true);
      const result = await prepareBuilderImageFile(file);
      setLoading(false);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setError('');
      setInputValue(result.value);
      onImageChange(result.value);
      return;
    }
  };

  return (
    <div className="space-y-3">
      {currentUrl && (
        <div className="rounded-xl overflow-hidden border border-[#3a4a49]/30 bg-[#0a0a0a] h-32 flex items-center justify-center">
          <img src={currentUrl} alt={label} className="max-w-full max-h-full object-contain" />
        </div>
      )}

      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />
          <div className="w-full py-3 rounded-xl border border-dashed border-[#3a4a49]/60 text-[#e5e2e1]/40 text-sm hover:border-[#00FBFB]/30 hover:text-[#00FBFB]/60 transition-colors text-center">
            {loading ? 'מעלה...' : '📁 בחרו תמונה'}
          </div>
        </label>

        <input
          type="text"
          placeholder="או הדביקו URL"
          value={inputValue}
          onChange={(e) => {
            const nextValue = e.target.value;
            setInputValue(nextValue);

            if (!nextValue.trim()) {
              setError('');
              onImageChange('');
              return;
            }

            if (nextValue.trim().startsWith('data:image/') && nextValue.includes(',')) {
              commitImageValue(nextValue);
              return;
            }

            setError('');
            onImageChange(nextValue);
          }}
          onBlur={() => commitImageValue(inputValue)}
          onPaste={handlePaste}
          className="flex-1 bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-xl px-4 py-3 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors"
        />
      </div>

      {currentUrl && currentUrl.startsWith('data:') && (
        <p className="text-[10px] text-[#00FBFB]/50">✓ תמונה מהמחשב שלכם</p>
      )}

      {error && (
        <p className="text-[11px] leading-relaxed text-red-300">{error}</p>
      )}
    </div>
  );
}
