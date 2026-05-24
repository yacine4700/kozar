"use client";

import React, { useState } from 'react';
import { WorkshopSettings, updateSettings } from '@/actions/settings/settings.actions';
import { Save, Loader2, Store } from 'lucide-react';

export function WorkshopSettingsForm({ initialSettings }: { initialSettings: WorkshopSettings | null }) {
  const [formData, setFormData] = useState({
    workshop_name: initialSettings?.workshop_name || '',
    workshop_address: initialSettings?.workshop_address || '',
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
      setMessage({ type: 'success', text: 'تم حفظ معلومات الورشة بنجاح.' });
      setTimeout(() => setMessage(null), 3000);
    }
    
    setIsSaving(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <Store size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">معلومات الورشة</h2>
          <p className="text-sm font-medium text-gray-500 mt-1">البيانات الأساسية لورشة الخياطة الخاصة بك</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">اسم الورشة</label>
            <input
              type="text"
              value={formData.workshop_name}
              onChange={(e) => setFormData(prev => ({ ...prev, workshop_name: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="مثال: زهرة الربيع"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">عنوان الورشة</label>
            <textarea
              value={formData.workshop_address}
              onChange={(e) => setFormData(prev => ({ ...prev, workshop_address: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-24"
              placeholder="أدخل عنوان الورشة بالكامل..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSaving || !initialSettings?.id}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}
