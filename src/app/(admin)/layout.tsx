import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { getCurrentProfile } from '@/actions/auth/auth.actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        <TopNav profile={profile} />
        {children}
      </div>
    </div>
  );
}
