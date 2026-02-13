"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { createHotelRoom } from "@/features/admin/accommodation/server-actions";

const schema = z.object({
  hotelCode: z.string().min(1),
  roomType: z.string().min(1),
  hotelIdentifier: z.string().min(1),
  address: z.string().min(1),
  description: z.string().min(1),
  available: z.boolean(),
  genderRestriction: z.enum(["MALE", "FEMALE"]),
  adminReserved: z.boolean(),
  price: z.number().min(0),
  noOfRoomsAvailable: z.number().min(1),
});

type FormValues = z.infer<typeof schema>;

export function HotelRoomForm({
  facilityId,
  onSuccess,
}: {
  facilityId: string;
  onSuccess?: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hotelCode: "",
      roomType: "",
      hotelIdentifier: "",
      address: "",
      description: "",
      price: 0,
      noOfRoomsAvailable: 1,
      genderRestriction: "MALE",
      available: true,
      adminReserved: false,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createHotelRoom({
        facilityId,
        ...values,
      });

      toast.success("Hotel room created");
      onSuccess?.();
    } catch {
      toast.error("Failed to create hotel room");
    }
  }

  return (
    <div className="space-y-10 flex flex-col">
      <div className="pt-5">
        <h2 className="text-3xl font-bold ">Add Hotel Room</h2>
      </div>

      <div className="flex-1">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col justify-between h-full"
          >
            <div className="space-y-5">
              <div className="flex justify-between gap-4">
                <InputField
                  form={form}
                  name="hotelCode"
                  label="Hotel Code"
                  className="w-full"
                />
                <InputField
                  form={form}
                  name="roomType"
                  label="Room Type"
                  className="w-full"
                />
              </div>
              <InputField
                form={form}
                name="hotelIdentifier"
                label="Hotel Identifier"
              />
              <InputField form={form} name="address" label="Address" />
              <InputField form={form} name="description" label="Description" />

              <div className="flex justify-between gap-4 w-full">
                <NumberField
                  form={form}
                  name="price"
                  label="Price"
                  className="w-full"
                />
                <NumberField
                  form={form}
                  name="noOfRoomsAvailable"
                  label="Number of Rooms Available"
                  className="w-full"
                />
              </div>

              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <GenderSelect form={form} className="w-full flex-3" />
                </div>

                <div className="flex-1">
                  <BooleanSelect
                    form={form}
                    name="available"
                    label="Available"
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <BooleanSelect
                    form={form}
                    name="adminReserved"
                    label="Admin Reserved"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="self-end w-full">
              <Button
                type="submit"
                className="w-full bg-brand-red hover:bg-brand-red/80"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

function InputField({ form, name, label, className }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={`${className}`}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function NumberField({ form, name, label, className }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={`${className}`}>
          <FormLabel>{label}</FormLabel>
          <Input
            type="number"
            value={field.value ?? ""}
            onChange={e => field.onChange(Number(e.target.value))}
          />
        </FormItem>
      )}
    />
  );
}

function GenderSelect({ form, className }: any) {
  return (
    <FormField
      control={form.control}
      name="genderRestriction"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Gender</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className={`${className}`}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}

function BooleanSelect({ form, name, label, className }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={String(field.value)}
            onValueChange={val => field.onChange(val === "true")}
          >
            <SelectTrigger className={`${className}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
}
