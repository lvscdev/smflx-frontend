import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// const schema = z.object({
//   email: z.email("Enter a valid email"),
// });

// const schema = z.object({
//   email: z.email("Email address is required"),
// });

const schema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address"),
});

function EmailEntry({ onNext }: { onNext: () => void }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit() {
    // 🔥 send OTP server action here
    onNext();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col h-full justify-between"
    >
      <div className="space-y-1.5">
        <label className="text-sm font-medium inline-block">
          Email Address
        </label>

        <Input
          placeholder="Enter your email"
          {...form.register("email")}
          className="border-slate-300"
        />

        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <Button className="w-full bg-brand-red hover:bg-brand-red/80">
        Save Profile & Proceed
      </Button>
    </form>
  );
}

export default EmailEntry;
