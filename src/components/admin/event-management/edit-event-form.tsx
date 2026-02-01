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
import { toast } from "sonner";

import { editEventSchema } from "@/lib/event-form-schema";
import { updateEvent } from "@/app/api/event-actions";
import { EventYear } from "@/app/api/event";

type EditEventFormValues = z.infer<typeof editEventSchema>;

function EditEventForm({
  event,
  disabled,
  onSuccess,
}: {
  event: EventYear;
  disabled: boolean;
  onSuccess: () => void;
}) {
  const form = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      theme: event.theme,
      startDate: event.startDate,
      endDate: event.endDate,
    },
  });

  async function onSubmit(values: EditEventFormValues) {
    await updateEvent(event.year, values);
    toast.success("Event updated successfully");
    form.reset(values);
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Theme</FormLabel>
              <FormControl>
                <Input {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {!disabled && (
          <Button
            type="submit"
            className="w-full bg-brand-red"
            disabled={!form.formState.isDirty}
          >
            Save Changes
          </Button>
        )}
      </form>
    </Form>
  );
}

export { EditEventForm };
