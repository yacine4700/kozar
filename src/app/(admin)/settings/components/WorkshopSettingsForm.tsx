"use client";

import React, { useState, useRef } from 'react';
import { WorkshopSettings, updateSettings } from '@/actions/settings/settings.actions';
import { Store, Loader2, CheckCircle2, XCircle } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function WorkshopSettingsForm({ initialSettings }: { initialSettings: WorkshopSettings | null }) {
  const [formData, setFormData] = useState({
    workshop_name: initialSettings?.workshop_name || '',
    workshop_address: initialSettings?.workshop_address || '',
  });
  
  const lastSavedData = useRef({ ...formData });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBlur = async (field: keyof typeof formData) => {
    if (!initialSettings?.id) return;
    
    // Only save if the value has changed
    if (formData[field] === lastSavedData.current[field]) return;

    setSaveStatus('saving');
    setErrorMessage(null);

    const result = await updateSettings(initialSettings.id, { [field]: formData[field] });
    
    if (result.error) {
      setSaveStatus('error');
      setErrorMessage(result.error);
    } else {
      lastSavedData.current[field] = formData[field];
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus(current => current === 'saved' ? 'idle' : current);
      }, 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <Store size={24} />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              معلومات الورشة
              {saveStatus === 'saving' && (
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                  <Loader2 size={12} className="animate-spin" /> جاري الحفظ...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md animate-in fade-in">
                  <CheckCircle2 size={12} /> تم الحفظ
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md animate-in fade-in">
                  <XCircle size={12} /> خطأ في الحفظ
                </span>
              )}
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">البيانات الأساسية لورشة الخياطة الخاصة بك</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl font-bold text-sm bg-red-50 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">اسم الورشة</label>
            <input
              type="text"
              value={formData.workshop_name}
              onChange={(e) => setFormData(prev => ({ ...prev, workshop_name: e.target.value }))}
              onBlur={() => handleBlur('workshop_name')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="مثال: زهرة الربيع"
            />
          </div>
          
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">عنوان الورشة</label>
            <textarea
              value={formData.workshop_address}
              onChange={(e) => setFormData(prev => ({ ...prev, workshop_address: e.target.value }))}
              onBlur={() => handleBlur('workshop_address')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-24"
              placeholder="أدخل عنوان الورشة بالكامل..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
