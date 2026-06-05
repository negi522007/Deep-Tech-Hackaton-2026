import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import Topbar from '@/components/Topbar';
import AuthGate from '@/components/AuthGate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar />
          <main className="flex-1 min-w-0 p-5 md:p-8 pb-24 md:pb-8">{children}</main>
        </div>
        <MobileNav />
      </div>
    </AuthGate>
  );
}
