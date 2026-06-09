import { getSettings } from '@/actions/settings/settings.actions';
import { getUsers } from '@/actions/settings/users.actions';
import { SettingsTabs } from './components/SettingsTabs';
import { Settings, ShieldAlert } from 'lucide-react';
import { getCurrentProfile } from '@/actions/auth/auth.actions';
import { hasPageAccess } from '@/lib/permissions';

export const metadata = {
  title: 'الإعدادات | زهرة الربيع',
  description: 'إدارة إعدادات الورشة، المعلومات القانونية، وحسابات المستخدمين.',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  
  if (!hasPageAccess(profile, 'settings')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <ShieldAlert size={64} className="text-red-400 mb-6" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">عذراً، لا تملك صلاحية الوصول</h2>
        <p>ليس لديك الصلاحيات اللازمة لعرض أو تعديل الإعدادات.</p>
      </div>
    );
  }

  const [settingsResponse, usersResponse] = await Promise.all([
    getSettings(),
    getUsers()
  ]);

  const settingsError = settingsResponse.error;
  const usersError = usersResponse.error;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <Settings size={24} />
            <span className="font-black uppercase tracking-widest text-sm">النظام</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">الإعدادات</h1>
          <p className="text-gray-500 font-medium mt-2">
            إدارة بيانات الورشة الأساسية والتحكم في حسابات وصلاحيات الموظفين.
          </p>
        </div>
      </header>

      {settingsError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold">
          خطأ في جلب الإعدادات: {settingsError}
        </div>
      )}
      {usersError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold">
          خطأ في جلب المستخدمين: {usersError}
        </div>
      )}

      <SettingsTabs 
        settings={settingsResponse.data || null} 
        users={usersResponse.data || []} 
      />
    </div>
  );
}
