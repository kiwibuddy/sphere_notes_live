import { NotesSubNav } from "@/components/layout/NotesSubNav";

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <NotesSubNav />
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
