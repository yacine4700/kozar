import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { getCurrentProfile } from '@/actions/auth/auth.actions';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
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
  );
}
