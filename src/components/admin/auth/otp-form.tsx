"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { adminOtpSchema, AdminOtpInput } from "@/features/admin/auth/schemas";
import {
  validateAdminOtpClient,
  resendAdminOtpClient,
} from "@/features/admin/auth/client-actions";
import { useCountdown } from "@/hooks/useCountdown";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AdminOtpForm() {
  const params = useSearchParams();
  const router = useRouter();

  const [isVerifying, startVerify] = useTransition();
  const [isResending, startResend] = useTransition();

  const email = params.get("email");
  const redirect = params.get("redirect") ?? "/admin";

  const initialRef = params.get("ref");
  const [otpRef, setOtpRef] = useState(initialRef);

  const { remaining, expired, reset } = useCountdown(300);

  const form = useForm<AdminOtpInput>({
    resolver: zodResolver(adminOtpSchema),
    defaultValues: {
      email: email ?? "",
      otp: "",
      otpReference: otpRef ?? "",
    },
  });

  // keep RHF in sync with reference
  useEffect(() => {
    if (otpRef) {
      form.setValue("otpReference", otpRef);
    }
  }, [otpRef, form]);

  if (!email || !otpRef) {
    return (
      <p className="text-sm text-red-600">
        Invalid OTP session. Please restart login.
      </p>
    );
  }

  function onSubmit(values: AdminOtpInput) {
    startVerify(async () => {
      try {
        await validateAdminOtpClient(values);
        toast.success("Log in successful");
        router.push(redirect);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "OTP verification failed",
        );
      }
    });
  }

  // FOR REFERENCE ONLY

  // function onSubmit(values: AdminOtpInput) {
  //   startVerify(async () => {
  //     await validateAdminOtpAction(values, redirect);
  //   });
  // }

  function onResend() {
    if (!email) return;

    startResend(async () => {
      try {
        const res = await resendAdminOtpClient({ email });

        toast.success("New OTP sent to your email");

        // NEW reference
        setOtpRef(res.data.reference);

        // reset countdown + form
        reset();
        form.reset({
          email,
          otp: "",
          otpReference: res.data.reference,
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to resend OTP",
        );
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="otp">OTP</Label>
              <FormControl>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  disabled={isVerifying || isResending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-brand-red hover:bg-brand-red/80"
          disabled={isVerifying || isResending}
        >
          {isVerifying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Verify OTP"
          )}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {expired
              ? "OTP expired"
              : `Expires in ${Math.floor(remaining / 60)}:${String(
                  remaining % 60,
                ).padStart(2, "0")}`}
          </span>

          <Button
            type="button"
            variant="ghost"
            onClick={onResend}
            disabled={!expired || isResending}
          >
            {isResending ? "Resending…" : "Resend OTP"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
