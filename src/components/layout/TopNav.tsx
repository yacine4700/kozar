"use client";

import { User, Menu } from 'lucide-react';
import { MinimalProfile } from '@/lib/permissions';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useSidebar } from './SidebarContext';

export function TopNav({ profile }: { profile?: MinimalProfile & { full_name?: string | null } | null }) {
  const { toggle } = useSidebar();

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-2.5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 flex items-center gap-4">
        <button 
          onClick={toggle}
          className="p-2 -mr-2 text-slate-500 hover:text-indigo-600 lg:hidden rounded-xl hover:bg-indigo-50 transition-colors"
        >
          <Menu size={24} />
        </button>
        {/* Placeholder for future breadcrumbs or search */}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <NotificationsDropdown />

        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-200">
          <div className="text-left dir-ltr hidden sm:block">
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
