'use client';

import { useState } from 'react';

interface ImageUploadProps {
  currentUrl?: string;
  onImageChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ currentUrl, onImageChange, label = 'תמונה' }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onImageChange(dataUrl);
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        setLoading(true);
        const file = item.getAsFile();
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          onImageChange(dataUrl);
          setLoading(false);
        };
        reader.readAsDataURL(file);
      }
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
            {loading ? 'העלאה...' : '📁 בחרו תמונה'}
          </div>
        </label>

        <input
          type="text"
          placeholder="או הדביקו URL"
          value={currentUrl || ''}
          onChange={(e) => onImageChange(e.target.value)}
          onPaste={handlePaste}
          className="flex-1 bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-xl px-4 py-3 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors"
        />
      </div>

      {currentUrl && currentUrl.startsWith('data:') && (
        <p className="text-[10px] text-[#00FBFB]/50">✓ תמונה מהמחשב שלך (Base64)</p>
      )}
    </div>
  );
}
