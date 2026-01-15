// // "use client";

// // import { useForm } from "react-hook-form";
// // import { z } from "zod";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";
// // import { toast } from "sonner";

// // const schema = z.object({
// //   theme: z.string().min(3),
// //   year: z.number(),
// //   startDate: z.string(),
// //   endDate: z.string(),
// //   description: z.string().optional(),
// // });

// // type FormValues = z.infer<typeof schema>;

// // export function CreateEventDrawer({
// //   open,
// //   onClose,
// // }: {
// //   open: boolean;
// //   onClose: () => void;
// // }) {
// //   const form = useForm<FormValues>({ resolver: zodResolver(schema) });

// //   function onSubmit() {
// //     toast.success("Event created successfully");
// //     onClose();
// //   }

// //   return (
// //     <Drawer open={open} onOpenChange={onClose}>
// //       <DrawerContent>
// //         <DrawerHeader>Create Event</DrawerHeader>
// //         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
// //           <Input placeholder="Event theme" {...form.register("theme")} />
// //           <Input
// //             type="number"
// //             placeholder="Year"
// //             {...form.register("year", { valueAsNumber: true })}
// //           />
// //           <Input type="date" {...form.register("startDate")} />
// //           <Input type="date" {...form.register("endDate")} />
// //           <Input placeholder="Description" {...form.register("description")} />
// //           <Button type="submit" className="w-full">
// //             Create
// //           </Button>
// //         </form>
// //       </DrawerContent>
// //     </Drawer>
// //   );
// // }

// "use client";

// import { ReactNode } from "react";
// import { Form, useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { Label } from "@/components/ui/label";
// import { FormField } from "@/components/ui/form";

// const schema = z.object({
//   theme: z.string().min(3, "Theme is required"),
//   year: z.number(),
//   startDate: z.string(),
//   endDate: z.string(),
//   description: z.string().optional(),
// });

// type FormValues = z.infer<typeof schema>;

// export function CreateEventModal({ children }: { children: ReactNode }) {
//   const form = useForm<FormValues>({ resolver: zodResolver(schema) });

//   function onSubmit() {
//     toast.success("Event created successfully");
//   }

//   return (
//     <Dialog>
//       <DialogTrigger asChild>{children}</DialogTrigger>
//       <DialogContent className="max-w-lg">
//         <DialogHeader className="">
//           <DialogTitle className="text-2xl font-bold text-slate-950">
//             Create Event
//           </DialogTitle>
//           <DialogDescription className="mb-4 text-slate-500">
//             Set up your event and start managing everything in one place.
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//           <FormField
//             control={form.control}
//             name="theme"
//             render={({ field }) => (
//               <>
//                 <Label htmlFor="theme">Theme</Label>
//                 <Input placeholder="Event theme" {...field} />
//               </>
//             )}
//           />
//           <Input
//             type="number"
//             placeholder="Year"
//             {...form.register("year", { valueAsNumber: true })}
//           />
//           <Input type="date" {...form.register("startDate")} />
//           <Input type="date" {...form.register("endDate")} />
//           <Input placeholder="Description" {...form.register("description")} />

//           <Button type="submit" className="w-full">
//             Create Event
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const schema = z.object({
  // theme: z.string().min(3, "Theme is required"),
  theme: z
    .string()
    .min(1, "Event theme is required")
    .min(3, "Event theme must be at least 3 characters"),
  year: z.number().min(2000, "Enter a valid year").int(),
  // year: z.number().min(1, "Year is required").min(2000, "Enter a valid year"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().optional(),
});
// const schema = z.object({
//   theme: z.string().min(3),
//   // year: z.coerce.number().min(2000, "Enter a valid year"),
//   year: z.number(),
//   startDate: z.string(),
//   endDate: z.string(),
//   description: z.string().optional(),
// });

type FormValues = z.infer<typeof schema>;

export function CreateEventModal({ children }: { children: ReactNode }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      theme: "",
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
      description: "",
    },
  });

  async function onSubmit(values: FormValues) {
    // await createEvent(values)
    toast.success("Event created successfully");
    form.reset();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="mt-10">
          <DialogTitle className="text-2xl font-bold text-slate-950">
            Create Event
          </DialogTitle>
          <DialogDescription className="mb-4 text-slate-500">
            Set up your event and start managing everything in one place.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-950 text-xs">
                    Theme
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event theme" {...field} />
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
                  <FormLabel>Event Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                      <Input type="date" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional description" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Create Event
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
