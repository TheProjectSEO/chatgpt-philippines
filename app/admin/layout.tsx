import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add Auth0 server-side authentication check
  // const session = await getSession();
  // if (!session) {
  //   redirect('/login?returnTo=/admin');
  // }

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
