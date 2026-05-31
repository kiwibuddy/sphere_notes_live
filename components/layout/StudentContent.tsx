import { cn } from "@/lib/utils";

type ContentWidth = "narrow" | "default" | "wide" | "full";

const WIDTH: Record<ContentWidth, string> = {
  narrow: "max-w-2xl",
  default: "max-w-3xl",
  wide: "max-w-5xl",
  full: "max-w-6xl",
};

interface StudentContentProps {
  children: React.ReactNode;
  width?: ContentWidth;
  className?: string;
  scroll?: boolean;
}

export function StudentContent({
  children,
  width = "default",
  className,
  scroll = true,
}: StudentContentProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-4 md:px-6 md:py-6 lg:px-8",
        WIDTH[width],
        scroll && "flex-1 overflow-y-auto",
        !scroll && "flex flex-1 flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}
