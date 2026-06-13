import { GameDraft, MediaItem } from '@/types/builder';

const MAX_ORIGINAL_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
const MAX_DATA_IMAGE_BYTES = 850 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

type ImageSuccess = { ok: true; value: string };
type ImageFailure = { ok: false; error: string };
export type BuilderImageResult = ImageSuccess | ImageFailure;

type ValidationSuccess = { ok: true };
type ValidationFailure = { ok: false; error: string };
export type BuilderDraftImageValidationResult = ValidationSuccess | ValidationFailure;

const OVERSIZE_IMAGE_MESSAGE = 'התמונה גדולה מדי לתצוגה מקדימה. נסו להעלות תמונה קטנה יותר או לדחוס את הקובץ.';
const UNSUPPORTED_IMAGE_MESSAGE = 'אפשר להעלות רק קובצי תמונה תקינים.';
const IMAGE_PROCESSING_MESSAGE = 'לא הצלחנו לעבד את התמונה. נסו קובץ אחר או הקטינו את הקובץ.';

export const MAX_LOCAL_STORAGE_ITEM_BYTES = 3_500_000;

export function isImageDataUrl(value?: string | null): value is string {
  return typeof value === 'string' && value.trim().startsWith('data:image/');
}

export function estimateStoredValueBytes(value: string): number {
  return new Blob([value]).size;
}

export function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

export function validateBuilderImageValue(value: string): BuilderImageResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { ok: true, value: '' };
  }

  if (!isImageDataUrl(trimmed)) {
    return { ok: true, value: trimmed };
  }

  if (estimateDataUrlPayloadBytes(trimmed) > MAX_DATA_IMAGE_BYTES) {
    return { ok: false, error: OVERSIZE_IMAGE_MESSAGE };
  }

  return { ok: true, value: trimmed };
}

export async function prepareBuilderImageFile(file: File): Promise<BuilderImageResult> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: UNSUPPORTED_IMAGE_MESSAGE };
  }

  if (file.size > MAX_ORIGINAL_IMAGE_FILE_BYTES) {
    return { ok: false, error: OVERSIZE_IMAGE_MESSAGE };
  }

  try {
    const sourceDataUrl = await readFileAsDataUrl(file);

    if (file.type === 'image/svg+xml') {
      return validateBuilderImageValue(sourceDataUrl);
    }

    const image = await loadImage(sourceDataUrl);
    const dataUrl = renderOptimizedImage(image, file.type);

    return validateBuilderImageValue(dataUrl);
  } catch {
    return { ok: false, error: IMAGE_PROCESSING_MESSAGE };
  }
}

export function validateDraftImagePayloads(draft: GameDraft): BuilderDraftImageValidationResult {
  const draftImages = collectDraftImageSources(draft);

  for (const image of draftImages) {
    if (!image.url || !isImageDataUrl(image.url)) {
      continue;
    }

    if (estimateDataUrlPayloadBytes(image.url) > MAX_DATA_IMAGE_BYTES) {
      return {
        ok: false,
        error: `${image.label} גדולה מדי לתצוגה מקדימה. נסו להעלות תמונה קטנה יותר או לדחוס את הקובץ.`,
      };
    }
  }

  return { ok: true };
}

function collectDraftImageSources(draft: GameDraft): Array<{ label: string; url?: string }> {
  const entries: Array<{ label: string; url?: string }> = [];

  draft.media.forEach((item, index) => {
    if (item.type !== 'image') {
      return;
    }

    entries.push({
      label: item.id === 'game-hero' ? 'תמונת הכותרת' : `תמונת מדיה כללית ${index + 1}`,
      url: item.url,
    });
  });

  entries.push({ label: 'מפת החוויה', url: draft.mapMedia?.url });

  draft.stations.forEach((station, index) => {
    const stationNumber = index + 1;

    entries.push({
      label: `תמונת הנרטיב בשלב ${stationNumber}`,
      url: station.narrativeMedia?.url,
    });
    entries.push({
      label: `תמונת המשימה בשלב ${stationNumber}`,
      url: station.taskMedia?.url,
    });
    entries.push({
      label: `תמונת חידת המעבר בשלב ${stationNumber}`,
      url: station.transitionRiddle?.media?.url,
    });

    station.media.forEach((item: MediaItem, mediaIndex) => {
      if (item.type !== 'image') {
        return;
      }

      entries.push({
        label: `תמונת מדיה בשלב ${stationNumber} (${mediaIndex + 1})`,
        url: item.url,
      });
    });
  });

  return entries;
}

function estimateDataUrlPayloadBytes(dataUrl: string): number {
  const [, base64Part = ''] = dataUrl.split(',', 2);
  const sanitized = base64Part.trim();
  const padding = sanitized.endsWith('==') ? 2 : sanitized.endsWith('=') ? 1 : 0;

  return Math.max(0, Math.floor((sanitized.length * 3) / 4) - padding);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('failed to load image'));
    image.src = dataUrl;
  });
}

function renderOptimizedImage(image: HTMLImageElement, sourceType: string): string {
  const { width, height } = scaleToMaxDimension(image.naturalWidth, image.naturalHeight, MAX_IMAGE_DIMENSION);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('no canvas context');
  }

  context.drawImage(image, 0, 0, width, height);

  const outputType = sourceType === 'image/png' ? 'image/png' : 'image/jpeg';
  return canvas.toDataURL(outputType, outputType === 'image/jpeg' ? JPEG_QUALITY : undefined);
}

function scaleToMaxDimension(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
