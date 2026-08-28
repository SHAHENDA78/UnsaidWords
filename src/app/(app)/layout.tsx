import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ArchiveLock } from "@/components/layout/ArchiveLock";
import { FollowUpChecker } from "@/components/feelings/FollowUpChecker";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ArchiveLock>
      <div className="min-h-screen bg-page">
        <Sidebar />
        <div className="lg:ml-52 pb-20 lg:pb-0">{children}</div>
        <MobileNav />
        <FollowUpChecker />
      </div>
    </ArchiveLock>
  );
}