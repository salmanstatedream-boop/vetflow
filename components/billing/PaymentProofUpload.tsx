'use client';

import { useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface PaymentProofUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  label?: string;
}

export default function PaymentProofUpload({
  file,
  onChange,
  required = false,
  label = 'Upload payment receipt',
}: PaymentProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {file ? (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container/30 border border-outline-variant/40">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs text-on-surface truncate flex-1">{file.name}</span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="text-on-surface-variant hover:text-destructive p-1"
            aria-label="Remove receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-outline-variant text-xs font-semibold text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Upload className="w-4 h-4" />
          Choose image or PDF
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0] ?? null;
          onChange(next);
        }}
      />
      <p className="text-[10px] text-on-surface-variant/60">PDF, JPG, PNG, or WEBP — max 5 MB</p>
    </div>
  );
}
