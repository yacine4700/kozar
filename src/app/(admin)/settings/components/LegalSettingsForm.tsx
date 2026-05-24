"use client";

import React, { useState } from 'react';
import { WorkshopSettings, updateSettings } from '@/actions/settings/settings.actions';
import { Save, Loader2, FileText } from 'lucide-react';

export function LegalSettingsForm({ initialSettings }: { initialSettings: WorkshopSettings | null }) {
  const [formData, setFormData] = useState({
    rc: initialSettings?.rc || '',
    nif: initialSettings?.nif || '',
    ai: initialSettings?.ai || '',
    nis: initialSettings?.nis || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialSettings?.id) return;

    setIsSaving(true);
    setMessage(null);

    const result = await updateSettings(initialSettings.id, formData);
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'تم حفظ المعلومات القانونية بنجاح.' });
      setTimeout(() => setMessage(null), 3000);
    }
    
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
          <FileText size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">المعلومات القانونية</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">تفاصيل السجل التجاري والضرائب (RC, NIF, AI, NIS)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">السجل التجاري (RC)</label>
            <input
              type="text"
              value={formData.rc}
              onChange={(e) => setFormData(prev => ({ ...prev, rc: e.target.value }))}
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
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-left dir-ltr"
              placeholder="15 digits"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSaving || !initialSettings?.id}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}
