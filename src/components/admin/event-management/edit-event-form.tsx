"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { editEventSchema } from "@/features/admin/events/event-form-schema";
import { updateEventAction } from "@/features/admin/events/server-actions";
import { Event } from "@/features/admin/events/types";
import { Loader2 } from "lucide-react";

type EditEventFormValues = z.infer<typeof editEventSchema>;

function extractDate(iso?: string) {
  return iso ? iso.split("T")[0] : "";
}

function extractTime(iso?: string) {
  return iso ? iso.split("T")[1]?.slice(0, 5) : "";
}

export function EditEventForm({
  event,
  disabled,
  onSuccess,
}: {
  event: Event;
  disabled: boolean;
  onSuccess: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      eventName: event.eventName,
      year: Number(event.eventYear),

      startDate: extractDate(event.startDate),
      endDate: extractDate(event.endDate),

      registrationOpens: extractDate(event.registrationOpenAt),
      registrationOpensTime: extractTime(event.registrationOpenAt),

      registrationCloses: extractDate(event.registrationCloseAt),
      registrationClosesTime: extractTime(event.registrationCloseAt),

      accommodationNeeded: event.accommodationNeeded,
      status: event.eventStatus,
      description: event.description ?? "",
    },
  } as const);
  console.log("event", event);

  const onSubmit = async (values: EditEventFormValues) => {
    try {
      await updateEventAction(event.eventId, values);
      toast.success("Event updated successfully");
      form.reset(values);
      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update event",
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Event name */}
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Year */}
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Year</FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Registration */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="registrationOpens"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Opens</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationOpensTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="registrationCloses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Closes</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationClosesTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={disabled} />
              </FormControl>
            </FormItem>
          )}
        />

        {!disabled && (
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full bg-brand-red hover:bg-brand-red/80"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        )}
      </form>
    </Form>
  );
}
