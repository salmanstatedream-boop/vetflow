'use client';

import type { ReactNode } from 'react';
import Modal from '@/components/ui/premium/Modal';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: FormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size={size}>
      <div className="max-h-[65vh] overflow-y-auto -mx-1 px-1">{children}</div>
      {footer && (
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-outline-variant/30">{footer}</div>
      )}
    </Modal>
  );
}
