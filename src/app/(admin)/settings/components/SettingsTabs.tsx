"use client";

import React, { useState } from 'react';
import { WorkshopSettingsForm } from './WorkshopSettingsForm';
import { LegalSettingsForm } from './LegalSettingsForm';
import { UserManagementView } from './UserManagementView';
import { WorkshopSettings } from '@/actions/settings/settings.actions';
import { UserProfile } from '@/actions/settings/users.actions';
import { Settings, Users } from 'lucide-react';

interface Props {
  settings: WorkshopSettings | null;
  users: UserProfile[];
}

export function SettingsTabs({ settings, users }: Props) {
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-black transition-all border-b-2 ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Settings size={18} />
          إعدادات عامة
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-black transition-all border-b-2 ${
            activeTab === 'users'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Users size={18} />
          إدارة المستخدمين
        </button>
      </div>

      <div>
        {activeTab === 'general' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <WorkshopSettingsForm initialSettings={settings} />
            <LegalSettingsForm initialSettings={settings} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <UserManagementView users={users} />
          </div>
        )}
      </div>
    </div>
  );
}
