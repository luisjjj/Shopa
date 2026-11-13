"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";

const MAX_FILE_MB = 20;

export default function ProductImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  const clearPreview = () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreview(null);
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (busy) return;
      if (!file.type.startsWith("image/")) {
        setError("That file is not an image. Choose a JPG, PNG or WebP photo.");
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`That photo is too large. Keep it under ${MAX_FILE_MB}MB.`);
        return;
      }

      setError("");
      clearPreview();
      const localUrl = URL.createObjectURL(file);
      previewRef.current = localUrl;
      setPreview(localUrl);
      setBusy(true);

      try {
        const { blob, ext } = await compressImage(file);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Your session expired. Sign in again to upload.");
          clearPreview();
          return;
        }

        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, blob, { contentType: blob.type || "image/jpeg" });

        if (uploadError) {
          setError("Image upload failed. Try again.");
          clearPreview();
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("products").getPublicUrl(path);
        onChange(publicUrl);
      } catch {
        setError("Could not process that image. Try another.");
        clearPreview();
      } finally {
        setBusy(false);
      }
    },
    [busy, onChange]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void handleFile(file);
  };

  const removeImage = () => {
    clearPreview();
    onChange("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const shown = preview || value;

  if (shown) {
    return (
      <div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
          <img
            src={shown}
            alt="Product preview"
            className="h-full w-full object-cover"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleInput}
            disabled={busy}
            aria-label="Change product image"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait"
          />
          {busy ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/45 text-white">
              <span className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span className="text-xs font-medium">Uploading photo...</span>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8">
              <span className="text-xs font-medium text-white/90">Tap to change photo</span>
            </div>
          )}
          {!busy && (
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 z-30 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-red-500 shadow-sm hover:bg-white dark:bg-black/75 dark:hover:bg-black"
            >
              Remove
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Square or portrait photos fill product cards best.
        </p>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className="relative flex h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 text-gray-400 transition-colors hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-500 dark:border-white/[0.1] dark:bg-white/[0.02] dark:hover:border-brand-500 dark:hover:bg-brand-950/10"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInput}
          disabled={busy}
          aria-label="Upload product image"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait"
        />
        {busy ? (
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-brand-500 animate-spin" />
            Uploading photo...
          </span>
        ) : (
          <>
            <svg className="mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Tap to upload image</span>
            <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              or drag a photo here
            </span>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
