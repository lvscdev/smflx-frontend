import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col gap-5 items-center justify-center">
      <h1 className="text-2xl text-center">
        Watch This Space, Something hOOGE is coming soon!!
      </h1>

      <Button asChild>
        <Link href="/admin">Go to Admin</Link>
      </Button>
    </div>
  );
}
