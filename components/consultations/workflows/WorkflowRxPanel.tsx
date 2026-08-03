'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { WorkflowPrescriptionItem } from '@/lib/consultations/workflow-types';
import WorkflowSectionCard, {
  fieldClass,
  labelClass,
  textareaClass,
} from '@/components/consultations/workflows/WorkflowSectionCard';

export type CatalogProduct = {
  id: string;
  name: string;
  type: string;
  sellingPrice: number;
};

type WorkflowRxPanelProps = {
  summary?: string;
  notes: string;
  onNotesChange: (value: string) => void;
  notesLabel?: string;
  noPrescriptionNeeded: boolean;
  onNoPrescriptionNeededChange: (value: boolean) => void;
  prescriptionItems: WorkflowPrescriptionItem[];
  onPrescriptionItemsChange: (items: WorkflowPrescriptionItem[]) => void;
  medicineProducts: CatalogProduct[];
};

function emptyLine(): WorkflowPrescriptionItem {
  return {
    productId: null,
    medicineName: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantityRequested: 1,
    instructions: '',
  };
}

export default function WorkflowRxPanel({
  summary,
  notes,
  onNotesChange,
  notesLabel = 'Notes (shown as recommendations on owner prescription copy)',
  noPrescriptionNeeded,
  onNoPrescriptionNeededChange,
  prescriptionItems,
  onPrescriptionItemsChange,
  medicineProducts,
}: WorkflowRxPanelProps) {
  const updateLine = (index: number, patch: Partial<WorkflowPrescriptionItem>) => {
    onPrescriptionItemsChange(
      prescriptionItems.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  return (
    <div className="space-y-4">
      {summary ? (
        <WorkflowSectionCard title="Consultation Summary">
          <p className="text-xs text-on-surface-variant whitespace-pre-wrap">{summary}</p>
        </WorkflowSectionCard>
      ) : null}

      <WorkflowSectionCard title="Prescription (Rx)">
        <div>
          <label className={labelClass}>{notesLabel}</label>
          <textarea value={notes} onChange={(e) => onNotesChange(e.target.value)} className={textareaClass} />
        </div>

        <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
          <input
            type="checkbox"
            checked={noPrescriptionNeeded}
            onChange={(e) => {
              onNoPrescriptionNeededChange(e.target.checked);
              if (e.target.checked) onPrescriptionItemsChange([]);
            }}
            className="rounded border-outline-variant"
          />
          No prescription needed for this visit
        </label>

        {!noPrescriptionNeeded ? (
          <div className="space-y-3 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-primary uppercase">Items dispensed</p>
              <button
                type="button"
                onClick={() => onPrescriptionItemsChange([...prescriptionItems, emptyLine()])}
                className="text-[10px] font-bold text-primary inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add medicine
              </button>
            </div>
            {prescriptionItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-surface-container/20 border border-outline-variant/30 space-y-2"
              >
                <div className="flex justify-between gap-2">
                  <select
                    value={item.productId || ''}
                    onChange={(e) => {
                      const selected = medicineProducts.find((p) => p.id === e.target.value);
                      updateLine(idx, {
                        productId: e.target.value || null,
                        medicineName: selected?.name ?? item.medicineName,
                      });
                    }}
                    className={fieldClass}
                  >
                    <option value="">Select medicine (optional catalog link)</option>
                    {medicineProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      onPrescriptionItemsChange(prescriptionItems.filter((_, i) => i !== idx))
                    }
                    className="text-destructive shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  placeholder="Medicine name *"
                  value={item.medicineName}
                  onChange={(e) => updateLine(idx, { medicineName: e.target.value })}
                  className={fieldClass}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Dosage *"
                    value={item.dosage}
                    onChange={(e) => updateLine(idx, { dosage: e.target.value })}
                    className={fieldClass}
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Qty *"
                    value={item.quantityRequested}
                    onChange={(e) =>
                      updateLine(idx, { quantityRequested: Number(e.target.value) || 1 })
                    }
                    className={fieldClass}
                  />
                  <input
                    placeholder="Frequency *"
                    value={item.frequency}
                    onChange={(e) => updateLine(idx, { frequency: e.target.value })}
                    className={fieldClass}
                  />
                  <input
                    placeholder="Duration *"
                    value={item.duration}
                    onChange={(e) => updateLine(idx, { duration: e.target.value })}
                    className={fieldClass}
                  />
                </div>
                <input
                  placeholder="Instructions"
                  value={item.instructions ?? ''}
                  onChange={(e) => updateLine(idx, { instructions: e.target.value })}
                  className={fieldClass}
                />
              </div>
            ))}
          </div>
        ) : null}
      </WorkflowSectionCard>
    </div>
  );
}
