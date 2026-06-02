import { redirect } from "next/navigation";

/** Legacy path — student home is now `/student` (slides). */
export default function SlidesLegacyRedirect({
  searchParams,
}: {
  searchParams: { event?: string; day?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.event) params.set("event", searchParams.event);
  const q = params.toString();
  redirect(q ? `/student?${q}` : "/student");
}
