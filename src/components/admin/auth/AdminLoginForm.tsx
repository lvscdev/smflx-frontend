"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  adminLoginSchema,
  AdminLoginInput,
} from "@/features/auth/admin/schemas";
import { loginAdmin } from "@/features/auth/admin/actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

export function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  async function onSubmit(values: AdminLoginInput) {
    setIsLoading(true);

    try {
      await loginAdmin(values);
      toast.success("Login successful");
      // router.push('/admin')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="text-gray-500 border-gray-300 border shadow-xs py-2.5 px-3.5"
                  aria-invalid={!!form.formState.errors.email}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="password" className="text-gray-700">
                Password
              </Label>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="text-gray-500 border-gray-300 border shadow-xs py-2.5 px-3.5"
                  aria-invalid={!!form.formState.errors.password}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full bg-brand-red text-brand-red-foreground hover:bg-brand-red/80 focus:ring-4 focus:ring-brand-red/50 disabled:opacity-50 disabled:pointer-events-none font-medium shadow-md"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? "Logging in…" : "Login"}
          </Button>

          <div className="text-right">
            <a
              href="/admin/forgot-password"
              className="text-sm text-brand-red hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>
      </form>
    </Form>
  );
}
