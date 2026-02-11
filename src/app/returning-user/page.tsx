import { redirect } from "next/navigation";

interface Props {
  searchParams?: {
    email?: string;
  };
}

export default function ReturningUserPage({ searchParams }: Props) {
  const email = searchParams?.email;

  if (email) {
    redirect(`/register?view=login&email=${encodeURIComponent(email)}`);
  }

  redirect("/register?view=login");
}
