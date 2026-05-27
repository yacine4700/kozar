"use client";

import React, { useState, useMemo } from 'react';
import { Package, Plus, X, Tag, Ruler, Loader2, Save } from 'lucide-react';
import { addProduct } from '@/actions/products/add-product';
import { updateProduct } from '@/actions/products/update-product';

const PREDEFINED_SIZES = ['6 أشهر', 'عام', 'عامين', '4 سنوات', '6 سنوات'];

interface ProductFormProps {
  onSuccess?: () => void;
  initialData?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    colors: string[];
    sizes: string[];
  };
}

export const ProductForm = ({ onSuccess, initialData }: ProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [colors, setColors] = useState<string[]>(initialData?.colors || []);
  const [colorInput, setColorInput] = useState('');
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || []);

  const hasChanges = useMemo(() => {
    if (!initialData) return true;

    const isNameChanged = name.trim() !== (initialData.name || '').trim();
    const isDescriptionChanged = (description || '').trim() !== (initialData.description || '').trim();
    const isPriceChanged = (price ? parseFloat(price) : 0) !== (initialData.price || 0);
    
    const isColorsChanged = JSON.stringify([...colors].sort()) !== JSON.stringify([...(initialData.colors || [])].sort());
    const isSizesChanged = JSON.stringify([...sizes].sort()) !== JSON.stringify([...(initialData.sizes || [])].sort());

    return isNameChanged || isDescriptionChanged || isPriceChanged || isColorsChanged || isSizesChanged;
  }, [name, description, price, colors, sizes, initialData]);

  const handleAddColor = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColors(colors.filter(c => c !== colorToRemove));
  };

  const toggleSize = (size: string) => {
    setSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    const payload = {
      name,
      description,
      price: price ? parseFloat(price) : 0,
      colors,
      sizes
    };

    const result = initialData?.id 
      ? await updateProduct(initialData.id, payload)
      : await addProduct(payload);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      if (!initialData) {
        // Reset form only if adding new
        setName('');
        setDescription('');
        setPrice('');
        setColors([]);
        setSizes([]);
      }
      if (onSuccess) onSuccess();
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
          <Package size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">
            {initialData ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
          <p className="text-slate-500 font-medium text-xs mt-1">
            {initialData ? 'قم بتحديث تفاصيل المنتج الحالي.' : 'أدخل تفاصيل الموديل الجديد، والألوان، والمقاسات المتاحة.'}
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl font-bold flex items-center justify-between">
          <span>{initialData ? 'تم تحديث المنتج بنجاح!' : 'تمت إضافة المنتج بنجاح!'}</span>
          <button onClick={() => setSuccess(false)} className="text-emerald-500 hover:text-emerald-700">
            <X size={20} />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl font-bold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <X size={20} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest block">اسم الموديل</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: قفطان تلمساني"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-bold text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest block">السعر الأساسي (اختياري)</label>
            <div className="relative">
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-bold text-sm"
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">د.ج</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 uppercase tracking-widest block">وصف المنتج (اختياري)</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="أضف وصفاً مختصراً للمنتج..."
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 font-bold resize-none text-sm"
          />
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Tag size={16} className="text-slate-400" />
            الألوان المتاحة
          </label>
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {colors.map(color => (
                <div key={color} className="bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                  <span>{color}</span>
                  <button type="button" onClick={() => removeColor(color)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {colors.length === 0 && (
                <span className="text-slate-400 font-medium text-sm py-2">لا يوجد ألوان محددة حتى الآن.</span>
              )}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={handleAddColor}
                placeholder="أضف لوناً (مثال: عنابي، أزرق ذهبي)... ثم اضغط Enter"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
              />
              <button 
                type="button" 
                onClick={handleAddColor}
                className="bg-indigo-100 text-indigo-700 px-4 rounded-xl font-bold hover:bg-indigo-200 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                إضافة
              </button>
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Ruler size={16} className="text-slate-400" />
            المقاسات / الأعمار المتاحة
          </label>
          <div className="flex flex-wrap gap-3">
            {PREDEFINED_SIZES.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all border-2 ${
                  sizes.includes(size) 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting || (initialData && !hasChanges)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                {initialData ? <Save size={18} /> : <Plus size={18} />}
                {initialData ? 'حفظ التغييرات' : 'حفظ المنتج'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
