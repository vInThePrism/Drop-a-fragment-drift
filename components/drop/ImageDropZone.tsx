"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";

interface ImageDropZoneProps {
  onFile: (file: File) => void;
  onClear: () => void;
  preview: string | null;
}

export function ImageDropZone({ onFile, onClear, preview }: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-[var(--color-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Attached image preview"
            className="w-full object-cover max-h-56"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--color-ink)] text-[var(--color-paper)] text-xs flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border transition-colors duration-150 py-8 px-4 cursor-pointer"
          style={{
            borderWidth: "1px",
            borderStyle: "dashed",
            borderColor: dragging ? "var(--color-ember)" : "var(--color-border)",
            backgroundColor: dragging
              ? "oklch(97% 0.012 80 / 0.5)"
              : "transparent",
          }}
          aria-label="Attach an image (optional)"
        >
          <span
            className="text-2xl"
            aria-hidden
            style={{ opacity: 0.35 }}
          >
            ⌁
          </span>
          <p className="font-[family-name:var(--font-inter-tight)] text-xs text-[var(--color-ink-dim)] text-center">
            Attach an image
            <br />
            <span className="opacity-60">drag & drop or click · optional</span>
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        aria-label="Upload image"
      />
    </div>
  );
}
