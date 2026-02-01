"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminRegistrationSchema } from "@/features/admin/registration/schemas";
import { z } from "zod";

import { EventYear } from "@/app/api/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioCard } from "@/components/admin/ui/radio-card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type FormValues = z.infer<typeof adminRegistrationSchema>;

function AddRegistrationForm({
  events,
  onSuccess,
}: {
  events: EventYear[];
  onSuccess: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(adminRegistrationSchema),
    defaultValues: {
      eventId: events.find(e => e.status === "Open")?.id,
      attendeeType: "camper",
      paymentStatus: "paid",
    },
  });

  const attendeeType = form.watch("attendeeType");

  function onSubmit(values: FormValues) {
    console.log("ADMIN CREATE REGISTRATION", values);

    // 🔥 server action goes here
    // await createAdminRegistration(values)

    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.theme} ({event.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Personal Info */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
              <div className="grid grid-cols-3 gap-4">
                <RadioCard
                  label="Camper"
                  selected={field.value === "camper"}
                  onClick={() => field.onChange("camper")}
                />
                <RadioCard
                  label="Physical"
                  selected={field.value === "physical"}
                  onClick={() => field.onChange("physical")}
                />
                <RadioCard
                  label="Online"
                  selected={field.value === "online"}
                  onClick={() => field.onChange("online")}
                />
              </div>
            </FormItem>
          )}
        />

        {/* Accommodation */}
        {attendeeType === "camper" && (
          <FormField
            control={form.control}
            name="accommodationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accommodation</FormLabel>
                <div className="grid grid-cols-3 gap-4">
                  <RadioCard
                    label="Hostel"
                    selected={field.value === "hostel"}
                    onClick={() => field.onChange("hostel")}
                  />
                  <RadioCard
                    label="Hotel"
                    selected={field.value === "hotel"}
                    onClick={() => field.onChange("hotel")}
                  />
                  <RadioCard
                    label="Shared"
                    selected={field.value === "shared"}
                    onClick={() => field.onChange("shared")}
                  />
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full bg-brand-red hover:bg-brand-red/80"
        >
          Create Registration
        </Button>
      </form>
    </Form>
  );
}

export { AddRegistrationForm };
