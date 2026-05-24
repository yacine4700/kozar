"use client";

import { User } from 'lucide-react';
import { MinimalProfile } from '@/lib/permissions';
import { NotificationsDropdown } from './NotificationsDropdown';

export function TopNav({ profile }: { profile?: MinimalProfile & { full_name?: string | null } | null }) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex-1">
        {/* Placeholder for future breadcrumbs or search */}
      </div>

      <div className="flex items-center gap-6">
        <NotificationsDropdown />

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-left dir-ltr">
            <p className="text-sm font-black text-slate-800">{profile?.full_name || 'المستخدم الحالي'}</p>
            <p className="text-xs font-bold text-slate-400 capitalize">{profile?.role === 'admin' ? 'مدير' : 'موظف'}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
