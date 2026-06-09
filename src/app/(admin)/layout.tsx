import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { getCurrentProfile } from '@/actions/auth/auth.actions';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { getSettings } from '@/actions/settings/settings.actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  const settingsRes = await getSettings();
  const settings = settingsRes.data || null;

  return (
    <SettingsProvider initialSettings={settings}>
      <SidebarProvider>
        <div className="min-h-screen bg-slate-50 flex">
          <Sidebar profile={profile} />
          <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
            <TopNav profile={profile} />
            <main className="flex-1 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SettingsProvider>
  );
}
