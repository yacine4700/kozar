"use client";

import React, { useState, useRef } from 'react';
import { WorkshopSettings, updateSettings } from '@/actions/settings/settings.actions';
import { FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function LegalSettingsForm({ initialSettings }: { initialSettings: WorkshopSettings | null }) {
  const [formData, setFormData] = useState({
    rc: initialSettings?.rc || '',
    nif: initialSettings?.nif || '',
    ai: initialSettings?.ai || '',
    nis: initialSettings?.nis || '',
  });
  
  const lastSavedData = useRef({ ...formData });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBlur = async (field: keyof typeof formData) => {
    if (!initialSettings?.id) return;
    
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
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
          <FileText size={24} />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              المعلومات القانونية
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
            <p className="text-sm font-medium text-gray-500 mt-1">تفاصيل السجل التجاري والضرائب (RC, NIF, AI, NIS)</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl font-bold text-sm bg-red-50 text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">السجل التجاري (RC)</label>
            <input
              type="text"
              value={formData.rc}
              onChange={(e) => setFormData(prev => ({ ...prev, rc: e.target.value }))}
              onBlur={() => handleBlur('rc')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-left dir-ltr"
              placeholder="e.g. 16/00-0000000A00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">رقم التعريف الجبائي (NIF)</label>
            <input
              type="text"
              value={formData.nif}
              onChange={(e) => setFormData(prev => ({ ...prev, nif: e.target.value }))}
              onBlur={() => handleBlur('nif')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-left dir-ltr"
              placeholder="15 digits"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">المادة الضريبية (AI)</label>
            <input
              type="text"
              value={formData.ai}
              onChange={(e) => setFormData(prev => ({ ...prev, ai: e.target.value }))}
              onBlur={() => handleBlur('ai')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-left dir-ltr"
              placeholder="11 digits"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">رقم التعريف الإحصائي (NIS)</label>
            <input
              type="text"
              value={formData.nis}
              onChange={(e) => setFormData(prev => ({ ...prev, nis: e.target.value }))}
              onBlur={() => handleBlur('nis')}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-left dir-ltr"
              placeholder="15 digits"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
