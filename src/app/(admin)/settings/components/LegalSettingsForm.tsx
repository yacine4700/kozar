"use client";

import React from 'react';
import { WorkshopSettings, updateSettings } from '@/actions/settings/settings.actions';
import { FileText } from 'lucide-react';
import { SettingsListItem } from './SettingsListItem';

export function LegalSettingsForm({ initialSettings }: { initialSettings: WorkshopSettings | null }) {
  const handleSave = async (field: keyof WorkshopSettings, value: string) => {
    if (!initialSettings?.id) return { error: "لم يتم العثور على الإعدادات." };
    return await updateSettings(initialSettings.id, { [field]: value });
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
          <FileText size={24} />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">المعلومات القانونية</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">تفاصيل السجل التجاري والضرائب (RC, NIF, AI, NIS)</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        <SettingsListItem 
          label="السجل التجاري (RC)"
          value={initialSettings?.rc || ''}
          placeholder="e.g. 16/00-0000000A00"
          ltr={true}
          onSave={(val) => handleSave('rc', val)}
        />
        <SettingsListItem 
          label="رقم التعريف الجبائي (NIF)"
          value={initialSettings?.nif || ''}
          placeholder="15 digits"
          ltr={true}
          onSave={(val) => handleSave('nif', val)}
        />
        <SettingsListItem 
          label="المادة الضريبية (AI)"
          value={initialSettings?.ai || ''}
          placeholder="11 digits"
          ltr={true}
          onSave={(val) => handleSave('ai', val)}
        />
        <SettingsListItem 
          label="رقم التعريف الإحصائي (NIS)"
          value={initialSettings?.nis || ''}
          placeholder="15 digits"
          ltr={true}
          onSave={(val) => handleSave('nis', val)}
        />
      </div>
    </div>
  );
}
