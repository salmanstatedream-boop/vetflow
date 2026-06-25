'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createProductAction, createCategoryAction } from '@/lib/services/inventory-actions';
import { ProductSchema, type ProductInput } from '@/lib/validations/schemas';
import { buildProductTypeOptions, normalizeProductTypeSlug } from '@/lib/inventory/product-types';
import { calcSellingPrice, DEFAULT_PRODUCT_MARKUP_PERCENT } from '@/lib/inventory/pricing';
import { useCreatableOptions } from '@/lib/hooks/useCreatableOptions';
import Modal from '@/components/ui/premium/Modal';
import Button from '@/components/ui/premium/Button';
import Select from '@/components/ui/premium/Select';
import CreatableSelect from '@/components/ui/premium/CreatableSelect';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface ProductFormProps {
  categories: { id: string; name: string }[];
  branches: { id: string; name: string }[];
  activeBranchId?: string;
  variant?: 'default' | 'embedded';
  defaultMarkupPercent?: number;
  existingProductTypes?: string[];
}

export default function ProductForm({
  categories,
  branches,
  activeBranchId,
  variant = 'default',
  defaultMarkupPercent = DEFAULT_PRODUCT_MARKUP_PERCENT,
  existingProductTypes = [],
}: ProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(ProductSchema),
    shouldUnregister: false,
    defaultValues: {
      branchId: activeBranchId || (branches.length > 0 ? branches[0].id : ''),
      type: 'service',
      unit: 'pcs',
      stockQuantity: 0,
      reorderLevel: 5,
      purchasePrice: 0,
      sellingPrice: 0,
      trackExpiry: false,
      expiryDate: '',
    },
  });

  const typeWatch = watch('type');
  const branchIdWatch = watch('branchId');
  const categoryNameWatch = watch('categoryName');
  const trackExpiryWatch = watch('trackExpiry');
  const purchasePriceWatch = watch('purchasePrice');
  const sellingPriceManuallySet = useRef(false);

  useEffect(() => {
    if (sellingPriceManuallySet.current) return;
    const purchase = Number(purchasePriceWatch);
    if (purchase > 0) {
      setValue('sellingPrice', calcSellingPrice(purchase, defaultMarkupPercent), {
        shouldValidate: true,
      });
    }
  }, [purchasePriceWatch, defaultMarkupPercent, setValue]);

  const onCreateCategory = useCallback(async (label: string) => {
    const res = await createCategoryAction(label);
    if (!res.success) throw new Error(res.error);
    return { name: res.category!.name };
  }, []);

  const { options: categoryOptions, handleCreate: handleCreateCategory } = useCreatableOptions(
    categories,
    onCreateCategory
  );

  const typeSeed = useMemo(
    () => buildProductTypeOptions(existingProductTypes),
    [existingProductTypes]
  );

  const { options: typeOptions, handleCreate: handleCreateType } = useCreatableOptions(typeSeed, undefined, {
    refreshOnCreate: false,
  });

  const openModal = () => {
    setError(null);
    setSuccessMessage(null);
    sellingPriceManuallySet.current = false;
    setIsOpen(true);
  };

  const onInvalid = (fieldErrors: FieldErrors<ProductInput>) => {
    const firstKey = Object.keys(fieldErrors)[0] as keyof ProductInput | undefined;
    const firstError = firstKey ? fieldErrors[firstKey] : undefined;
    const message =
      firstError && typeof firstError === 'object' && 'message' in firstError
        ? String(firstError.message)
        : 'Please fix the highlighted fields before saving.';
    setError(message);
    if (fieldErrors.purchasePrice || fieldErrors.reorderLevel) {
      setShowAdvanced(true);
    }
  };

  const onSubmit = async (data: ProductInput) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await createProductAction(data);
      if (res.success) {
        reset({
          branchId: activeBranchId || (branches.length > 0 ? branches[0].id : ''),
          type: 'service',
          unit: 'pcs',
          stockQuantity: 0,
          reorderLevel: 5,
          purchasePrice: 0,
          sellingPrice: 0,
        });
        setShowAdvanced(false);
        setSuccessMessage('Saved');
        router.refresh();
        setTimeout(() => {
          setIsOpen(false);
          setSuccessMessage(null);
        }, 800);
      } else {
        setError(res.error || 'Failed to add product');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {variant === 'embedded' ? (
        <button
          type="button"
          onClick={openModal}
          className="block w-full text-center border border-primary text-primary py-2.5 rounded-xl text-xs font-bold hover:bg-primary/10 transition-colors"
        >
          Add catalog item
        </button>
      ) : (
        <Button type="button" onClick={openModal} icon={<Plus className="w-4 h-4" />}>
          Add Catalog Item
        </Button>
      )}

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Catalog Item"
        description="Quick-add a service or product. Category is optional — type a new name or leave blank."
        size="lg"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {error && (
            <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 text-destructive text-xs rounded-xl">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs rounded-xl font-semibold">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
            <input type="hidden" {...register('branchId')} />
            <input type="hidden" {...register('unit')} />
            <input type="hidden" {...register('type')} />

            <div>
              <label className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Item name
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. Consultation, Amoxicillin 250mg"
                className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl outline-none text-xs text-on-surface font-semibold"
              />
              {errors.name && (
                <span className="text-[10px] text-destructive mt-1 block">{errors.name.message}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <CreatableSelect
                  label="Type"
                  value={typeWatch || ''}
                  onChange={(v) =>
                    setValue('type', normalizeProductTypeSlug(v), { shouldValidate: true })
                  }
                  options={typeOptions}
                  onCreateOption={async (label) => {
                    const slug = normalizeProductTypeSlug(label);
                    await handleCreateType(slug);
                    setValue('type', slug, { shouldValidate: true });
                  }}
                  placeholder="Select or create type…"
                />
                {errors.type && (
                  <span className="text-[10px] text-destructive mt-1 block">{errors.type.message}</span>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Selling price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('sellingPrice', {
                    valueAsNumber: true,
                    onChange: () => {
                      sellingPriceManuallySet.current = true;
                    },
                  })}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant focus:border-primary rounded-xl outline-none text-xs text-on-surface font-bold"
                />
                {errors.sellingPrice && (
                  <span className="text-[10px] text-destructive mt-1 block">{errors.sellingPrice.message}</span>
                )}
              </div>
            </div>

            <div>
              <Select
                label="Branch"
                value={branchIdWatch}
                onChange={(v) => setValue('branchId', v, { shouldValidate: true })}
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
              />
              {errors.branchId && (
                <span className="text-[10px] text-destructive mt-1 block">{errors.branchId.message}</span>
              )}
            </div>

            <CreatableSelect
              label="Category (optional)"
              value={categoryNameWatch || ''}
              onChange={(v) => setValue('categoryName', v)}
              options={categoryOptions}
              onCreateOption={handleCreateCategory}
              placeholder="Select or create category…"
            />

            {typeWatch !== 'service' && (
              <div className="space-y-3 p-3 rounded-xl border border-outline-variant/40 bg-surface-container/20">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(trackExpiryWatch)}
                    onChange={(e) => {
                      setValue('trackExpiry', e.target.checked, { shouldValidate: true });
                      if (!e.target.checked) {
                        setValue('expiryDate', '', { shouldValidate: true });
                      }
                    }}
                    className="rounded border-outline-variant/60"
                  />
                  <span className="text-xs font-semibold text-on-surface">
                    This product has an expiry date
                  </span>
                </label>
                {trackExpiryWatch && (
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                      Expiry date
                    </label>
                    <input
                      type="date"
                      {...register('expiryDate')}
                      className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant focus:border-primary rounded-xl outline-none text-xs text-on-surface"
                    />
                    {errors.expiryDate && (
                      <span className="text-[10px] text-destructive mt-1 block">{errors.expiryDate.message}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {typeWatch !== 'service' && (
              <div>
                <label className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Initial stock quantity
                </label>
                <input
                  type="number"
                  {...register('stockQuantity', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant focus:border-primary rounded-xl outline-none text-xs text-on-surface"
                />
                {errors.stockQuantity && (
                  <span className="text-[10px] text-destructive mt-1 block">{errors.stockQuantity.message}</span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="text-[10px] font-semibold text-primary flex items-center gap-1"
            >
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              Advanced fields
            </button>

            <div className={showAdvanced ? 'space-y-3 pt-2 border-t border-outline-variant/30' : 'hidden'}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  {...register('brand')}
                  placeholder="Brand"
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant rounded-xl outline-none text-xs text-on-surface"
                />
                <input
                  type="text"
                  {...register('sku')}
                  placeholder="SKU"
                  className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant rounded-xl outline-none text-xs text-on-surface"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    {...register('purchasePrice', { valueAsNumber: true })}
                    placeholder="Purchase price"
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant rounded-xl outline-none text-xs text-on-surface"
                  />
                  {errors.purchasePrice && (
                    <span className="text-[10px] text-destructive mt-1 block">{errors.purchasePrice.message}</span>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    {...register('reorderLevel', { valueAsNumber: true })}
                    placeholder="Reorder level"
                    className="w-full px-3 py-2 bg-surface-container/30 border border-outline-variant rounded-xl outline-none text-xs text-on-surface"
                  />
                  {errors.reorderLevel && (
                    <span className="text-[10px] text-destructive mt-1 block">{errors.reorderLevel.message}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" className="w-1/2" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="w-1/2" loading={isLoading}>
                Add item
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
