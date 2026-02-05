"use client";

import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createEventSchema } from "@/features/admin/events/event-form-schema";
import { createEventAction } from "@/features/admin/events/server-actions";

type FormValues = z.infer<typeof createEventSchema>;

export function CreateEventModal({ children }: { children: ReactNode }) {
  const form = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      eventName: "",
      year: new Date().getFullYear(),
      venue: "",
      startDate: "",
      endDate: "",
      registrationOpens: "",
      registrationOpensTime: "",
      registrationCloses: "",
      registrationClosesTime: "",
      accommodationNeeded: false,
      status: "DRAFT",
      description: "",
    },
  });

  const EVENT_STATUS_OPTIONS = [
    { label: "Open", value: "DRAFT" },
    { label: "Active", value: "ACTIVE" },
    { label: "Ended", value: "CLOSED" },
  ] as const;

  // async function onSubmit(values: FormValues) {
  //   // await createEvent(values)
  //   toast.success("Event created successfully");
  //   form.reset();
  // }

  async function onSubmit(values: FormValues) {
    try {
      await createEventAction(values);
      console.log("Event created:", values);

      toast.success("Event created successfully");
      form.reset();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the event";

      toast.error(message);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="!max-w-3xl h-[90vh] overflow-auto sm:w-full p-4">
        <DialogHeader className="space-y-1 px-6 pt-6">
          <DialogTitle className="text-4xl font-bold text-slate-950">
            Create Event
          </DialogTitle>
          <DialogDescription className="mb-3 text-base text-slate-500">
            Set up your event and start managing everything in one place.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 max-h-[85vh] overflow-y-auto px-6 pb-6
    "
          >
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-950 text-sm">
                    Event Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter event name"
                      {...field}
                      className="border-slate-300 shadow-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-950">Event Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                      className="border-slate-300 shadow-xs"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-950">Venue</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter event venue"
                      {...field}
                      className="border-slate-300 shadow-xs"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-950">Start Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={field.value ? "date" : "text"}
                          placeholder="Select a date"
                          className="border-slate-300 shadow-xs"
                          value={field.value}
                          onFocus={e => (e.target.type = "date")}
                          onBlur={e => {
                            if (!e.target.value) e.target.type = "text";
                          }}
                          onChange={field.onChange}
                        />

                        <CalendarDays className="pointer-events-none size-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-950" />
                      </div>
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
                    <FormLabel className="text-slate-950">End Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={field.value ? "date" : "text"}
                          placeholder="Select a date"
                          className="border-slate-300 shadow-xs"
                          value={field.value}
                          onFocus={e => (e.target.type = "date")}
                          onBlur={e => {
                            if (!e.target.value) e.target.type = "text";
                          }}
                          onChange={field.onChange}
                        />

                        <CalendarDays className="pointer-events-none size-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-950" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="registrationOpens"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-950">
                      Registration Opens
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={field.value ? "date" : "text"}
                          placeholder="Select a date"
                          className="border-slate-300 shadow-xs"
                          value={field.value}
                          onFocus={e => (e.target.type = "date")}
                          onBlur={e => {
                            if (!e.target.value) e.target.type = "text";
                          }}
                          onChange={field.onChange}
                        />

                        <CalendarDays className="pointer-events-none size-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-950" />
                      </div>
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
                    <FormLabel className="text-slate-950">Time</FormLabel>

                    <FormControl>
                      <div className="relative">
                        <Input
                          type={field.value ? "time" : "text"}
                          placeholder="Select time"
                          className="border-slate-300 shadow-xs pr-10"
                          value={field.value}
                          onFocus={e => (e.target.type = "time")}
                          onBlur={e => {
                            if (!e.target.value) e.target.type = "text";
                          }}
                          onChange={field.onChange}
                        />

                        <Clock className="pointer-events-none size-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-950" />
                      </div>
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
                    <FormLabel className="text-slate-950">
                      Registration Closes
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={field.value ? "date" : "text"}
                          placeholder="Select a date"
                          className="border-slate-300 shadow-xs"
                          value={field.value}
                          onFocus={e => (e.target.type = "date")}
                          onBlur={e => {
                            if (!e.target.value) e.target.type = "text";
                          }}
                          onChange={field.onChange}
                        />

                        <CalendarDays className="pointer-events-none size-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-950" />
                      </div>
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
                    <FormLabel className="text-slate-950">Time</FormLabel>

                    <FormControl>
                      <div className="relative">
                        <Input
                          type={field.value ? "time" : "text"}
                          placeholder="Select time"
                          className="border-slate-300 shadow-xs pr-10"
                          value={field.value}
                          onFocus={e => (e.target.type = "time")}
                          onBlur={e => {
                            if (!e.target.value) e.target.type = "text";
                          }}
                          onChange={field.onChange}
                        />

                        <Clock className="pointer-events-none size-4.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-950" />
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="accommodationNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-950">
                      Accommodation
                    </FormLabel>

                    <FormControl>
                      <Select
                        value={field.value ? "yes" : "no"}
                        onValueChange={value => field.onChange(value === "yes")}
                      >
                        <SelectTrigger className="border-slate-300 w-full">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-950">
                      Event Status
                    </FormLabel>

                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="border-slate-300 w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>

                        <SelectContent>
                          {EVENT_STATUS_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-950">
                    Event Description
                    <span className="text-slate-500">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter event description"
                      {...field}
                      className="border-slate-300 shadow-xs min-h-20 resize-y"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full p-4 bg-brand-red text-sm hover:bg-brand-red/90"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
