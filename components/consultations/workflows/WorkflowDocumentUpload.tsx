'use client';

import { useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { uploadVisitDocumentAction } from '@/lib/services/document-actions';

type WorkflowDocumentUploadProps = {
  visitId: string;
  patientId: string;
  category: 'grooming_before' | 'grooming_after' | 'vaccine';
  label: string;
  documentIds: string[];
  onDocumentIdsChange: (ids: string[]) => void;
};

export default function WorkflowDocumentUpload({
  visitId,
  patientId,
  category,
  label,
  documentIds,
  onDocumentIdsChange,
}: WorkflowDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('visitId', visitId);
      fd.append('patientId', patientId);
      fd.append('category', category);
      fd.append('description', label);
      const res = await uploadVisitDocumentAction(fd);
      if (res.success && res.document?.id) {
        onDocumentIdsChange([...documentIds, res.document.id]);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-[10px] font-semibold text-primary border border-primary/25 px-2.5 py-1.5 rounded-md inline-flex items-center gap-1 disabled:opacity-60"
      >
        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileUp className="w-3 h-3" />}
        {label}
      </button>
      {documentIds.length > 0 ? (
        <ul className="space-y-1">
          {documentIds.map((id) => (
            <li key={id}>
              <a
                href={`/api/documents/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary hover:underline"
              >
                View file
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
