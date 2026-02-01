// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { adminOtpSchema, AdminOtpInput } from "@/features/auth/admin/schemas";
// import { validateAdminOtp } from "@/features/auth/admin/actions";
// import { useRouter, useSearchParams } from "next/navigation";
// import { toast } from "sonner";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";

// export function AdminOtpForm() {
//   const router = useRouter();
//   const params = useSearchParams();

//   const email = params.get("email");
//   const otpReference = params.get("ref");
//   const redirect = params.get("redirect") ?? "/admin";

//   const form = useForm<AdminOtpInput>({
//     resolver: zodResolver(adminOtpSchema),
//     defaultValues: {
//       email: email ?? "",
//       otp: "",
//       otpReference: otpReference ?? "",
//     },
//   });

//   async function onSubmit(values: AdminOtpInput) {
//     try {
//       const res = await validateAdminOtp(values);

//       // 🔐 Persist token for middleware
//       document.cookie = `admin_session=${res.token}; path=/; max-age=86400`;

//       toast.success("Authentication successful");

//       router.replace(redirect);
//     } catch (error) {
//       toast.error(
//         error instanceof Error ? error.message : "OTP verification failed",
//       );
//     }
//   }

//   if (!email || !otpReference) {
//     return (
//       <p className="text-sm text-red-600">
//         Invalid OTP session. Please restart login.
//       </p>
//     );
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//         <FormField
//           control={form.control}
//           name="otp"
//           render={({ field }) => (
//             <FormItem>
//               <Label htmlFor="otp">One-Time Password</Label>
//               <FormControl>
//                 <Input
//                   id="otp"
//                   inputMode="numeric"
//                   placeholder="123456"
//                   maxLength={6}
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <Button type="submit" className="w-full">
//           Verify OTP
//         </Button>
//       </form>
//     </Form>
//   );
// }

// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { adminOtpSchema, AdminOtpInput } from "@/features/auth/admin/schemas";
// import { validateAdminOtpAction } from "@/features/auth/admin/server-actions";
// import { useSearchParams } from "next/navigation";
// import { toast } from "sonner";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";

// export function AdminOtpForm() {
//   const params = useSearchParams();

//   const email = params.get("email");
//   const otpReference = params.get("ref");
//   const redirect = params.get("redirect") ?? "/admin";

//   const form = useForm<AdminOtpInput>({
//     resolver: zodResolver(adminOtpSchema),
//     defaultValues: {
//       email: email ?? "",
//       otp: "",
//       otpReference: otpReference ?? "",
//     },
//   });

//   async function onSubmit(values: AdminOtpInput) {
//     try {
//       await validateAdminOtpAction(values, redirect);
//       // redirect happens server-side
//     } catch (error) {
//       toast.error(
//         error instanceof Error ? error.message : "OTP verification failed",
//       );
//     }
//   }

//   if (!email || !otpReference) {
//     return (
//       <p className="text-sm text-red-600">
//         Invalid OTP session. Please restart login.
//       </p>
//     );
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//         <FormField
//           control={form.control}
//           name="otp"
//           render={({ field }) => (
//             <FormItem>
//               <Label htmlFor="otp">One-Time Password</Label>
//               <FormControl>
//                 <Input
//                   id="otp"
//                   inputMode="numeric"
//                   placeholder="123456"
//                   maxLength={6}
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <Button type="submit" className="w-full">
//           Verify OTP
//         </Button>
//       </form>
//     </Form>
//   );
// }

// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { adminOtpSchema, AdminOtpInput } from "@/features/admin/auth/schemas";
// import {
//   validateAdminOtpAction,
//   resendAdminOtpAction,
// } from "@/features/admin/auth/server-actions";
// import { useSearchParams } from "next/navigation";
// import { toast } from "sonner";
// import { useCountdown } from "@/hooks/useCountdown";
// import { useTransition } from "react";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Loader2 } from "lucide-react";

// export function AdminOtpForm() {
//   const params = useSearchParams();
//   const [isVerifying, startVerify] = useTransition();
//   const [isResending, startResend] = useTransition();

//   const email = params.get("email");
//   const otpReference = params.get("ref");
//   const redirect = params.get("redirect") ?? "/admin";

//   const { remaining, expired, reset } = useCountdown(300); // 5 minutes
//   console.log("OTP TIMER", { remaining, expired });

//   const form = useForm<AdminOtpInput>({
//     resolver: zodResolver(adminOtpSchema),
//     defaultValues: {
//       email: email ?? "",
//       otp: "",
//       otpReference: otpReference ?? "",
//     },
//   });

//   async function onSubmit(values: AdminOtpInput) {
//     startVerify(async () => {
//       try {
//         await validateAdminOtpAction(values, redirect);
//         console.log("REDIRECTING...");
//       } catch (error) {
//         toast.error(
//           error instanceof Error ? error.message : "OTP verification failed",
//         );
//       }
//     });
//   }

//   // async function onResend() {
//   //   if (!email) return;

//   //   startTransition(async () => {
//   //     try {
//   //       const res = await resendAdminOtpAction({ email });
//   //       toast.success("New OTP sent to your email");

//   //       // Update reference without reload
//   //       const url = new URL(window.location.href);
//   //       url.searchParams.set("ref", res.otpReference);
//   //       window.history.replaceState({}, "", url.toString());
//   //     } catch (error) {
//   //       toast.error(
//   //         error instanceof Error ? error.message : "Unable to resend OTP",
//   //       );
//   //     }
//   //   });
//   // }

//   async function onResend() {
//     if (!email) return;

//     startResend(async () => {
//       try {
//         const res = await resendAdminOtpAction({ email });

//         toast.success("New OTP sent to your email");

//         // 🔄 Update OTP reference in URL
//         const url = new URL(window.location.href);
//         url.searchParams.set("ref", res.otpReference);
//         window.history.replaceState({}, "", url.toString());

//         // 🔁 Reset countdown
//         reset();

//         // ✏️ Clear OTP input + update reference in form
//         form.reset({
//           email,
//           otp: "",
//           otpReference: res.otpReference,
//         });
//       } catch (error) {
//         toast.error(
//           error instanceof Error ? error.message : "Unable to resend OTP",
//         );
//       }
//     });
//   }

//   if (!email || !otpReference) {
//     return (
//       <p className="text-sm text-red-600">
//         Invalid OTP session. Please restart login.
//       </p>
//     );
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//         <FormField
//           control={form.control}
//           name="otp"
//           render={({ field }) => (
//             <FormItem>
//               <Label htmlFor="otp">OTP</Label>
//               <FormControl>
//                 <Input
//                   id="otp"
//                   inputMode="numeric"
//                   placeholder="123456"
//                   maxLength={6}
//                   disabled={expired || isResending || isVerifying}
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <Button
//           type="submit"
//           className="w-full bg-brand-red self-end hover:bg-brand-red/80"
//           disabled={expired || isVerifying}
//         >
//           {isVerifying ? (
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           ) : (
//             "Verify OTP"
//           )}
//         </Button>

//         <div className="flex items-center justify-between text-sm">
//           <span className="text-muted-foreground">
//             {expired
//               ? "OTP expired"
//               : `Expires in ${Math.floor(remaining / 60)}:${String(
//                   remaining % 60,
//                 ).padStart(2, "0")}`}
//           </span>

//           <Button
//             type="button"
//             variant="ghost"
//             onClick={onResend}
//             disabled={!expired || isResending}
//           >
//             Resend OTP
//           </Button>
//         </div>
//       </form>
//     </Form>
//   );
// }

"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { adminOtpSchema, AdminOtpInput } from "@/features/admin/auth/schemas";
import {
  validateAdminOtpAction,
  resendAdminOtpAction,
} from "@/features/admin/auth/server-actions";
import { useCountdown } from "@/hooks/useCountdown";

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

  // ✅ transitions must be independent
  const [isVerifying, startVerify] = useTransition();
  const [isResending, startResend] = useTransition();

  const email = params.get("email");
  const redirect = params.get("redirect") ?? "/admin";

  // ✅ URL param used ONLY for initialization
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

  // ✅ keep RHF in sync with reference
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
      await validateAdminOtpAction(values, redirect);
    });
  }

  // FOR REFERENCE ONLY

  // function onSubmit(values: AdminOtpInput) {
  //   startVerify(async () => {
  //     try {
  //       await validateAdminOtpAction(values, redirect);
  //     } catch (error) {
  //       toast.error(
  //         error instanceof Error ? error.message : "OTP verification failed",
  //       );
  //     }
  //   });
  // }

  function onResend() {
    if (!email) return;

    startResend(async () => {
      try {
        const res = await resendAdminOtpAction({ email });

        toast.success("New OTP sent to your email");

        // ✅ NEW reference becomes source of truth
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
