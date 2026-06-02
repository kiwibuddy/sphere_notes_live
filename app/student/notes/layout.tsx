import { NotesSubNav } from "@/components/layout/NotesSubNav";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <NotesSubNav />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
