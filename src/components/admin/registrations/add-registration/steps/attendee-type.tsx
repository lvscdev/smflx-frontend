"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { attendanceSchema } from "@/lib/profile-schema";
import { RadioCard } from "@/components/admin/ui/radio-card";

type FormValues = z.infer<typeof attendanceSchema>;

export default function AttendanceStep({ onNext }: { onNext: () => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      attendeeType: "camper",
      accommodationType: "hostel",
    },
  });

  const attendeeType = form.watch("attendeeType");

  function onSubmit(values: FormValues) {
    console.log(values); // persist to wizard store
    onNext();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-between h-full"
      >
        {/* Select Event */}
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Event</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Replace with dynamic events later */}
                    <SelectItem value="1">WOTH Camp Meeting 2026</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Attendee Type */}
          <FormField
            control={form.control}
            name="attendeeType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Attendee Type</FormLabel>

                <div className="grid grid-cols-2 gap-4">
                  <RadioCard
                    label="Camper"
                    description="Stay on-site with full camping experience"
                    selected={field.value === "camper"}
                    onClick={() => field.onChange("camper")}
                  />

                  <RadioCard
                    label="Physical Attendance"
                    description="Attend in person without camping"
                    selected={field.value === "physical"}
                    onClick={() => field.onChange("physical")}
                  />

                  <RadioCard
                    label="Online Participant"
                    description="Join us virtually via livestream"
                    selected={field.value === "online"}
                    onClick={() => field.onChange("online")}
                  />
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Accommodation Type */}
          {attendeeType === "camper" && (
            <FormField
              control={form.control}
              name="accommodationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accommodation Type</FormLabel>

                  <div className="grid grid-cols-3 gap-4">
                    <RadioCard
                      label="Hostel (Camper)"
                      description="45 spaces available"
                      selected={field.value === "hostel"}
                      onClick={() => field.onChange("hostel")}
                    />

                    <RadioCard
                      label="Hotel"
                      description="8 spaces available"
                      selected={field.value === "hotel"}
                      onClick={() => field.onChange("hotel")}
                    />

                    <RadioCard
                      label="Shared Apartment"
                      description="12 spaces available"
                      selected={field.value === "shared"}
                      onClick={() => field.onChange("shared")}
                    />
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {attendeeType === "camper" ? (
          <Button
            type="submit"
            className="w-full bg-brand-red hover:bg-brand-red/80"
          >
            Continue to Accommodation
          </Button>
        ) : (
          <Button
            type="submit"
            className="w-full bg-brand-red hover:bg-brand-red/80"
          >
            Create Registration
          </Button>
        )}
      </form>
    </Form>
  );
}
