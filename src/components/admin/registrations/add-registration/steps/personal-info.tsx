"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { profileSchema } from "@/lib/profile-schema";
import { RadioCard } from "@/components/admin/ui/radio-card";

type FormValues = z.infer<typeof profileSchema>;

export default function ProfileStep({ onNext }: { onNext: () => void }) {
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      ageRange: "",
      country: "",
      state: "",
      localAssembly: "",
      minister: undefined,
      employment: undefined,
      maritalStatus: undefined,
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values); // persist to wizard store later
    onNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Gender + Age */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ageRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age Range</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0-12">0–12 (Lively Kiddies)</SelectItem>
                    <SelectItem value="13-17">13–17 (Teens)</SelectItem>
                    <SelectItem value="18+">18+</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Country + State */}
        <div className="grid grid-cols-2 gap-4">
          {/* 
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nigeria" />
                </FormControl>
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="nigeria">Nigeria</SelectItem>
                    <SelectItem value="ghana">Ghana</SelectItem>
                    <SelectItem value="togo">Togo+</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State of Residence</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Lagos" />
                </FormControl>
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State of Residence</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lagos">Lagos</SelectItem>
                    <SelectItem value="imo">Imo</SelectItem>
                    <SelectItem value="enugu">Enugu</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Local Assembly */}
        <FormField
          control={form.control}
          name="localAssembly"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local Assembly</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Loveseal" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Minister */}
        <FormField
          control={form.control}
          name="minister"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Are you a Minister?</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <RadioCard
                  label="Yes"
                  description="I serve as a minister"
                  selected={field.value === "yes"}
                  onClick={() => field.onChange("yes")}
                />
                <RadioCard
                  label="No"
                  description="I am a member"
                  selected={field.value === "no"}
                  onClick={() => field.onChange("no")}
                />
              </div>
            </FormItem>
          )}
        />

        {/* Employment */}
        <FormField
          control={form.control}
          name="employment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employed Status</FormLabel>
              <div className="grid grid-cols-3 gap-4">
                <RadioCard
                  label="Employed"
                  description="Currently working"
                  selected={field.value === "employed"}
                  onClick={() => field.onChange("employed")}
                />
                <RadioCard
                  label="Unemployed"
                  description="Not working"
                  selected={field.value === "unemployed"}
                  onClick={() => field.onChange("unemployed")}
                />
                <RadioCard
                  label="Student"
                  description="In school / college"
                  selected={field.value === "student"}
                  onClick={() => field.onChange("student")}
                />
              </div>
            </FormItem>
          )}
        />

        {/* Marital */}
        <FormField
          control={form.control}
          name="maritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marital Status</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <RadioCard
                  label="Single"
                  description="Not married"
                  selected={field.value === "single"}
                  onClick={() => field.onChange("single")}
                />
                <RadioCard
                  label="Married"
                  description="Currently married"
                  selected={field.value === "married"}
                  onClick={() => field.onChange("married")}
                />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-brand-red mt-8 hover:bg-brand-red/80"
        >
          Save Profile & Proceed
        </Button>
      </form>
    </Form>
  );
}
