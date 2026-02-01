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
import { CalendarDays, Clock } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createEventSchema } from "@/lib/event-form-schema";

// const schema = z.object({
//   // theme: z.string().min(3, "Theme is required"),
//   theme: z
//     .string()
//     .min(1, "Event theme is required")
//     .min(3, "Event theme must be at least 3 characters"),
//   year: z.number().min(2000, "Enter a valid year").int(),
//   // year: z.number().min(1, "Year is required").min(2000, "Enter a valid year"),
//   startDate: z.string().min(1, "Start date is required"),
//   endDate: z.string().min(1, "End date is required"),
//   registrationOpens: z.string().min(1, "Registration date is required"),
//   registrationCloses: z.string().min(1, "Registration close date is required"),
//   registrationOpensTime: z.string().min(1, "Registration time is required"),
//   registrationClosesTime: z
//     .string()
//     .min(1, "Registration close time is required"),
//   description: z.string().optional(),
// });
// const schema = z.object({
//   theme: z.string().min(3),
//   // year: z.coerce.number().min(2000, "Enter a valid year"),
//   year: z.number(),
//   startDate: z.string(),
//   endDate: z.string(),
//   description: z.string().optional(),
// });

type FormValues = z.infer<typeof createEventSchema>;

export function CreateEventModal({ children }: { children: ReactNode }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      theme: "",
      year: new Date().getFullYear(),
      startDate: "",
      endDate: "",
      registrationOpens: "",
      registrationOpensTime: "",
      registrationCloses: "",
      registrationClosesTime: "",
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
      <DialogContent className="!max-w-3xl w-[90vw] sm:w-full p-0 pt-2">
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
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-950 text-sm">
                    Theme
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter event theme"
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

            <div className="grid grid-cols-2 gap-4">
              {/* <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-950">Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="border-slate-300 shadow-xs"
                        placeholder="Enter Start Date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

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

              {/* <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-950">End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="border-slate-300 shadow-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

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
              className="w-full p-4 bg-brand-red text-sm hover:bg-brand-red/90"
            >
              Create
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
