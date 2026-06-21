'use client';

import { useEffect, useRef, useState } from 'react';
import {
  MediaType,
  getMediaTypeFromFile,
  getMediaTypeFromUrl,
  prepareBuilderMediaFile,
  validateBuilderImageValue,
} from '@/lib/builderImage';

interface MediaUploadProps {
  currentUrl?: string;
  currentType?: MediaType;
  onMediaChange: (url: string, type: MediaType) => void;
  label?: string;
  accept?: MediaType[];
}

const ACCEPT_ALL = 'image/*,video/*,audio/*';

export default function MediaUpload({
  currentUrl,
  currentType,
  onMediaChange,
  label = 'מדיה',
  accept,
}: MediaUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState(currentUrl || '');
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setInputValue(currentUrl || '');
  }, [currentUrl]);

  const resolvedType: MediaType = currentType ?? getMediaTypeFromUrl(currentUrl || '');

  const buildAccept = () => {
    if (!accept) return ACCEPT_ALL;
    return accept.map((t) => `${t}/*`).join(',');
  };

  const commit = (url: string, type: MediaType) => {
    if (type === 'image') {
      const result = validateBuilderImageValue(url);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError('');
      onMediaChange(result.value, 'image');
    } else {
      setError('');
      onMediaChange(url, type);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setLoading(true);
    const result = await prepareBuilderMediaFile(file);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    setInputValue(result.value);
    onMediaChange(result.value, result.mediaType);
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (!item.type.startsWith('image/')) continue;
      e.preventDefault();
      const file = item.getAsFile();
      if (!file) return;
      setLoading(true);
      const result = await prepareBuilderMediaFile(file);
      setLoading(false);
      if (!result.ok) { setError(result.error); return; }
      setError('');
      setInputValue(result.value);
      onMediaChange(result.value, result.mediaType);
      return;
    }
  };

  const handleUrlChange = (next: string) => {
    setInputValue(next);
    if (!next.trim()) {
      setError('');
      onMediaChange('', 'image');
      return;
    }
    if (next.trim().startsWith('data:image/') && next.includes(',')) {
      commit(next, 'image');
      return;
    }
    setError('');
    const type = getMediaTypeFromUrl(next);
    onMediaChange(next, type);
  };

  const handleUrlBlur = () => {
    if (!inputValue.trim()) return;
    const type = getMediaTypeFromUrl(inputValue);
    commit(inputValue, type);
  };

  const isLocal = currentUrl?.startsWith('data:');

  return (
    <div className="space-y-3">
      {/* Preview */}
      {currentUrl && resolvedType === 'image' && (
        <div className="rounded-xl overflow-hidden border border-[#3a4a49]/30 bg-[#0a0a0a] h-32 flex items-center justify-center">
          <img src={currentUrl} alt={label} className="max-w-full max-h-full object-contain" />
        </div>
      )}
      {currentUrl && resolvedType === 'video' && (
        <div className="rounded-xl overflow-hidden border border-[#3a4a49]/30 bg-[#0a0a0a]">
          <video
            ref={videoRef}
            src={currentUrl}
            controls
            className="w-full max-h-48 object-contain"
            preload="metadata"
          />
        </div>
      )}
      {currentUrl && resolvedType === 'audio' && (
        <div className="rounded-xl border border-[#3a4a49]/30 bg-[#0a0a0a] p-3">
          <audio
            ref={audioRef}
            src={currentUrl}
            controls
            className="w-full"
          />
        </div>
      )}

      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer">
          <input
            type="file"
            accept={buildAccept()}
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />
          <div className="w-full py-3 rounded-xl border border-dashed border-[#3a4a49]/60 text-[#e5e2e1]/40 text-sm hover:border-[#00FBFB]/30 hover:text-[#00FBFB]/60 transition-colors text-center">
            {loading ? 'מעלה...' : `📁 בחרו ${label}`}
          </div>
        </label>

        <input
          type="text"
          placeholder="או הדביקו URL"
          value={inputValue}
          onChange={(e) => handleUrlChange(e.target.value)}
          onBlur={handleUrlBlur}
          onPaste={handlePaste}
          className="flex-1 bg-[#0a0a0a] border border-[#3a4a49]/60 rounded-xl px-4 py-3 text-[#e5e2e1] text-sm placeholder:text-[#e5e2e1]/20 focus:border-[#00FBFB]/50 outline-none transition-colors"
        />
      </div>

      {currentUrl && isLocal && (
        <p className="text-[10px] text-[#00FBFB]/50">
          ✓ {resolvedType === 'image' ? 'תמונה' : resolvedType === 'video' ? 'וידאו' : 'אודיו'} מהמחשב שלכם
        </p>
      )}

      {error && (
        <p className="text-[11px] leading-relaxed text-red-300">{error}</p>
      )}
    </div>
  );
}
