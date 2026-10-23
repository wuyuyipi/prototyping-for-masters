import { redirect } from "next/navigation";

interface RedirectProps {
  params: Promise<{ username: string }>;
}

export default async function LibraryUserRedirectPage({ params }: RedirectProps) {
  const { username } = await params;
  redirect(`/u/${encodeURIComponent(username)}`);
}
