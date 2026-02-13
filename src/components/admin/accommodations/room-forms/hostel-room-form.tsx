// "use client";

// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";
// import { Loader2 } from "lucide-react";

// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
// } from "@/components/ui/form";

// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";

// import { createHostelRoom } from "@/features/admin/accommodation/server-actions";

// const schema = z.object({
//   roomCode: z.string().min(1),
//   roomIdentifier: z.string().min(1),
//   capacity: z.number().min(1),
//   genderRestriction: z.enum(["MALE", "FEMALE", "MIXED"]),
//   adminReserved: z.boolean(),
// });

// type FormValues = z.infer<typeof schema>;

// export function HostelRoomForm({
//   facilityId,
//   onSuccess,
// }: {
//   facilityId: string;
//   onSuccess?: () => void;
// }) {
//   const form = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: { adminReserved: false },
//   });

//   async function onSubmit(values: FormValues) {
//     try {
//       await createHostelRoom({
//         facilityId,
//         ...values,
//       });

//       toast.success("Hostel room created");
//       onSuccess?.();
//     } catch {
//       toast.error("Failed to create hostel room");
//     }
//   }

//   return (
//     <>
//       <h2 className="text-2xl font-bold mb-4">Add Hostel Room</h2>

//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//           <FormField
//             control={form.control}
//             name="roomCode"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Room Code</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="roomIdentifier"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Room Identifier</FormLabel>
//                 <FormControl>
//                   <Input {...field} />
//                 </FormControl>
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="capacity"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Capacity</FormLabel>
//                 <Input
//                   type="number"
//                   value={field.value ?? ""}
//                   onChange={e => field.onChange(Number(e.target.value))}
//                 />
//               </FormItem>
//             )}
//           />

//           <Button
//             type="submit"
//             className="w-full bg-brand-red"
//             disabled={form.formState.isSubmitting}
//           >
//             {form.formState.isSubmitting ? (
//               <Loader2 className="animate-spin w-4 h-4" />
//             ) : (
//               "Save Room"
//             )}
//           </Button>
//         </form>
//       </Form>
//     </>
//   );
// }

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

import { createHostelRoom } from "@/features/admin/accommodation/server-actions";

const schema = z.object({
  roomCode: z.string().min(1),
  roomIdentifier: z.string().min(1),
  capacity: z.number().min(1),
  genderRestriction: z.enum(["MALE", "FEMALE"]),
  adminReserved: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function HostelRoomForm({
  facilityId,
  onSuccess,
}: {
  facilityId: string;
  onSuccess?: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomCode: "",
      roomIdentifier: "",
      capacity: 1,
      genderRestriction: "MALE",
      adminReserved: false,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await createHostelRoom({
        facilityId,
        ...values,
      });

      toast.success("Hostel room created");
      onSuccess?.();
    } catch {
      toast.error("Failed to create hostel room");
    }
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-4">Add Hostel Room</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <InputField form={form} name="roomCode" label="Room Code" />
          <InputField
            form={form}
            name="roomIdentifier"
            label="Room Identifier"
          />
          <NumberField form={form} name="capacity" label="Capacity" />
          <GenderSelect form={form} />
          <BooleanSelect
            form={form}
            name="adminReserved"
            label="Admin Reserved"
          />

          <Button
            type="submit"
            className="w-full bg-brand-red"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              "Save"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

function InputField({ form, name, label }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} value={field.value ?? ""} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function NumberField({ form, name, label }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
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

function GenderSelect({ form }: any) {
  return (
    <FormField
      control={form.control}
      name="genderRestriction"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Gender Restriction</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger>
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

function BooleanSelect({ form, name, label }: any) {
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
            <SelectTrigger>
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
