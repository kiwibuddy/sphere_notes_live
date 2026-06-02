import { SessionHeader } from "@/components/layout/SessionHeader";
import { StudentTabBar } from "@/components/layout/StudentTabBar";
import { StudentTopNav } from "@/components/layout/StudentTopNav";
import { ReactionsStrip } from "@/components/layout/ReactionsStrip";
import { StudentJoinRedirect } from "@/components/student/StudentJoinRedirect";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="student-app flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      <StudentJoinRedirect />
      <SessionHeader />
      <StudentTopNav />
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
      <ReactionsStrip />
      <StudentTabBar />
    </div>
  );
}
