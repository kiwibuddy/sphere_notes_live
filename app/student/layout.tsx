import { SessionHeader } from "@/components/layout/SessionHeader";
import { StudentTabBar } from "@/components/layout/StudentTabBar";
import { ReactionsStrip } from "@/components/layout/ReactionsStrip";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#EDEAE5] p-0 sm:p-4">
      <div className="phone-shell phone-shell-desktop">
        <SessionHeader />
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
        <ReactionsStrip />
        <StudentTabBar />
      </div>
    </div>
  );
}
