"use client";

import React from 'react';
import { WorkshopSettings, updateSettings } from '@/actions/settings/settings.actions';
import { Store } from 'lucide-react';
import { SettingsListItem } from './SettingsListItem';

export function WorkshopSettingsForm({ initialSettings }: { initialSettings: WorkshopSettings | null }) {
  const handleSave = async (field: keyof WorkshopSettings, value: string) => {
    if (!initialSettings?.id) return { error: "لم يتم العثور على الإعدادات." };
    return await updateSettings(initialSettings.id, { [field]: value });
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <Store size={24} />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">معلومات الورشة</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">البيانات الأساسية لورشة الخياطة الخاصة بك</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        <SettingsListItem 
          label="اسم الورشة"
          value={initialSettings?.workshop_name || ''}
          placeholder="مثال: زهرة الربيع"
          onSave={(val) => handleSave('workshop_name', val)}
        />
        <SettingsListItem 
          label="عنوان الورشة"
          value={initialSettings?.workshop_address || ''}
          placeholder="أدخل عنوان الورشة بالكامل..."
          type="textarea"
          onSave={(val) => handleSave('workshop_address', val)}
        />
      </div>
    </div>
  );
}
