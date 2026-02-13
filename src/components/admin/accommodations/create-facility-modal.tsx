"use client";

import { ReactNode, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createFacilitySchema,
  CreateFacilityValues,
} from "@/features/admin/accommodation/schemas";
import { createFacilityAction } from "@/features/admin/accommodation/server-actions";

import { Event } from "@/features/admin/events/types";
import { getAllEvents } from "@/features/admin/events/server-actions";
import { AccommodationCategory } from "@/features/admin/accommodation/types";

function CreateFacilityModal({
  children,
  defaultEventId,
  categories,
  onSuccess,
}: {
  children: ReactNode;
  defaultEventId?: string;
  categories?: AccommodationCategory[];
  onSuccess?: () => void;
}) {
  const [events, setEvents] = useState<Event[]>([]);

  const form = useForm<CreateFacilityValues>({
    resolver: zodResolver(createFacilitySchema),
    defaultValues: {
      eventId: defaultEventId,
      facilityName: "",
      accommodationCategoryId: "",
      employedUserPrice: 0,
      unemployedUserPrice: 0,
      totalCapacity: 0,
      available: true,
    },
  });

  useEffect(() => {
    if (defaultEventId) {
      form.setValue("eventId", defaultEventId);
    }
  }, [defaultEventId, form]);

  useEffect(() => {
    getAllEvents().then(setEvents);
  }, []);

  async function onSubmit(values: CreateFacilityValues) {
    try {
      await createFacilityAction(values);
      toast.success("Facility created successfully");
      onSuccess?.();
      form.reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create facility",
      );
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="!max-w-[650px] p-6">
        <DialogHeader className="h-fit mb-5 pt-5 text-left">
          <DialogTitle className="text-2xl font-bold">
            Create New Facility/Accommodation
          </DialogTitle>
          {/* <DialogDescription>
            Add hostels, hotels, or apartments for this event
          </DialogDescription> */}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 flex flex-col min-h-[70vh] justify-between"
          >
            {/* Event */}
            <div className="space-y-8">
              <FormField
                control={form.control}
                name="eventId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!!defaultEventId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Populate from API */}
                        {events.map((e: Event) => (
                          <SelectItem key={e.eventId} value={e.eventId}>
                            {e.eventName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Facility name & type */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="facilityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facility Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dansol Hostel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="accommodationCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facility Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hostel">Hostel</SelectItem>
                          <SelectItem value="hotel">Hotel</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <FormField
                  control={form.control}
                  name="accommodationCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facility Category</FormLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>

                        <SelectContent>
                          {categories?.length === 0 ? (
                            <SelectItem disabled value="none">
                              No categories available
                            </SelectItem>
                          ) : (
                            categories?.map(category => (
                              <SelectItem
                                key={category.categoryId}
                                value={category.categoryId}
                              >
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employedUserPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employed Price</FormLabel>
                      <Input
                        type="number"
                        // value={field.value ?? ""}
                        onChange={e => field.onChange(Number(e.target.value))}
                        placeholder="Enter employed price"
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="selfEmployedUserPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Self-Employed Price</FormLabel>
                      <Input
                        type="number"
                        // value={field.value ?? ""}
                        onChange={e => field.onChange(Number(e.target.value))}
                        placeholder="Enter self-employed price"
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unemployedUserPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unemployed Price</FormLabel>
                      <Input
                        type="number"
                        // value={field.value ?? ""}
                        onChange={e => field.onChange(Number(e.target.value))}
                        placeholder="Enter unemployed price"
                      />
                    </FormItem>
                  )}
                />
              </div>

              {/* Capacity */}
              <FormField
                control={form.control}
                name="totalCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Capacity</FormLabel>
                    <Input
                      type="number"
                      // value={field.value ?? ""}
                      onChange={e => field.onChange(Number(e.target.value))}
                      placeholder="Enter total capacity"
                    />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
              className="w-full bg-brand-red hover:bg-brand-red/80"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Accommodation"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateFacilityModal;
