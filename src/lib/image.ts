// Downscale + recompress photos in the browser before upload. Phone
// cameras produce 3-8MB files that crawl on mobile networks; a 1600px
// JPEG at 0.82 is visually identical on storefronts at a tenth the size.
export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.82
): Promise<{ blob: Blob; ext: string }> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image");
  if (file.size <= 400 * 1024) return { blob: file, ext: extOf(file.name) };

  const src = await decodeImage(file);
  try {
    const scale = Math.min(1, maxDim / Math.max(src.w, src.h));
    const cw = Math.max(1, Math.round(src.w * scale));
    const ch = Math.max(1, Math.round(src.h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { blob: file, ext: extOf(file.name) };
    ctx.drawImage(src.el, 0, 0, cw, ch);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob) return { blob: file, ext: extOf(file.name) };
    return { blob, ext: "jpg" };
  } finally {
    src.cleanup();
  }
}

function extOf(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "jpg";
  return ext.length <= 5 ? ext : "jpg";
}

async function decodeImage(file: File): Promise<{
  el: CanvasImageSource;
  w: number;
  h: number;
  cleanup: () => void;
}> {
  try {
    const bitmap = await createImageBitmap(file);
    return {
      el: bitmap,
      w: bitmap.width,
      h: bitmap.height,
      cleanup: () => bitmap.close(),
    };
  } catch {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read image"));
      el.src = url;
    });
    return {
      el: img,
      w: img.naturalWidth,
      h: img.naturalHeight,
      cleanup: () => setTimeout(() => URL.revokeObjectURL(url), 5000),
    };
  }
}
