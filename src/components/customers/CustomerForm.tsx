"use client";

import React, { useState, useMemo } from 'react';
import { User, Plus, Loader2, Save, Phone, MapPin } from 'lucide-react';
import { addCustomer } from '@/actions/customers/add-customer';
import { updateCustomer } from '@/actions/customers/update-customer';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  created_at: string;
}

interface CustomerFormProps {
  onSuccess: () => void;
  initialData?: Customer;
}

export const CustomerForm = ({ onSuccess, initialData }: CustomerFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [address, setAddress] = useState(initialData?.address || '');

  const hasChanges = useMemo(() => {
    if (!initialData) return true;

    const isNameChanged = name.trim() !== (initialData.name || '').trim();
    const isPhoneChanged = (phone || '').trim() !== (initialData.phone || '').trim();
    const isAddressChanged = (address || '').trim() !== (initialData.address || '').trim();

    return isNameChanged || isPhoneChanged || isAddressChanged;
  }, [name, phone, address, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('address', address);

    let result;
    if (initialData) {
      result = await updateCustomer(initialData.id, formData);
    } else {
      result = await addCustomer(formData);
    }

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="bg-white p-8 sm:p-12" dir="rtl">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center transform -rotate-6">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">
            {initialData ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
          </h2>
          <p className="text-slate-400 font-medium mt-1">
            {initialData ? 'قم بتحديث المعلومات أدناه' : 'أدخل بيانات التاجر الجديد'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              اسم التاجر / المتجر <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <User size={20} />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 rounded-2xl pr-12 pl-4 py-4 font-bold focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all placeholder:text-slate-300"
                placeholder="مثال: متجر الأناقة أو اسم التاجر"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-slate-200"></span>
              رقم الهاتف (واتساب)
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Phone size={20} />
              </div>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 rounded-2xl pr-12 pl-4 py-4 font-bold focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all placeholder:text-slate-300"
                placeholder="مثال: 0555555555"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-slate-200"></span>
              الولاية / العنوان
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <MapPin size={20} />
              </div>
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 rounded-2xl pr-12 pl-4 py-4 font-bold focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all placeholder:text-slate-300"
                placeholder="مثال: الجزائر العاصمة، رويبة"
              />
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting || (initialData && !hasChanges)}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                {initialData ? <Save size={20} /> : <Plus size={20} />}
                {initialData ? 'حفظ التغييرات' : 'إضافة العميل'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
