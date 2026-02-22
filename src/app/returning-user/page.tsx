import { redirect } from "next/navigation";

interface Props {
  searchParams?: {
    email?: string;
  };
}

export default function ReturningUserPage({ searchParams }: Props) {
  redirect("/register?view=login");
}
