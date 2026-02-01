// // "use client";

// // import { useForm } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { z } from "zod";
// // import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";
// // import { toast } from "sonner";
// // import { updateEvent } from "@/app/api/event-actions";
// // import { EventYear } from "@/app/api/event";

// // const schema = z.object({
// //   startDate: z.string(),
// //   endDate: z.string(),
// // });

// // function EditEventDrawer({
// //   event,
// //   open,
// //   onClose,
// // }: {
// //   event: EventYear;
// //   open: boolean;
// //   onClose: () => void;
// // }) {
// //   const form = useForm({
// //     resolver: zodResolver(schema),
// //     defaultValues: event,
// //   });

// //   async function onSubmit(values: any) {
// //     await updateEvent(event.year, values);
// //     toast.success("Event updated");
// //     onClose();
// //   }

// //   return (
// //     <Drawer open={open} onOpenChange={onClose}>
// //       <DrawerContent>
// //         <DrawerHeader>Edit Event – {event.year}</DrawerHeader>
// //         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
// //           <Input type="date" {...form.register("startDate")} />
// //           <Input type="date" {...form.register("endDate")} />
// //           <Button type="submit">Save Changes</Button>
// //         </form>
// //       </DrawerContent>
// //     </Drawer>
// //   );
// // }

// // export { EditEventDrawer };

// // "use client";

// // import { useEffect } from "react";
// // import { useForm } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { z } from "zod";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import {
// //   Form,
// //   FormControl,
// //   FormField,
// //   FormItem,
// //   FormLabel,
// //   FormMessage,
// // } from "@/components/ui/form";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";
// // import { toast } from "sonner";
// // import { updateEvent } from "@/app/api/event-actions";
// // import { EventYear } from "@/app/api/event";
// // import { editEventSchema } from "@/lib/event-form-schema";

// // // type FormValues = z.infer<typeof editEventSchema>;

// // // const form = useForm<z.infer<typeof eSchema>>({
// // //   resolver: zodResolver(eventDatesSchema),
// // //   defaultValues: {
// // //     startDate: event.startDate,
// // //     endDate: event.endDate,
// // //   },
// // // });

// // function EditEventModal({
// //   event,
// //   open,
// //   onClose,
// // }: {
// //   event: EventYear;
// //   open: boolean;
// //   onClose: () => void;
// // }) {
// //   const isEnded = event.status === "Ended";

// //   const form = useForm<FormValues>({
// //     resolver: zodResolver(editEventSchema),
// //     defaultValues: {
// //       theme: event.theme,
// //       startDate: event.startDate,
// //       endDate: event.endDate,
// //     },
// //   });

// //   async function onSubmit(values: FormValues) {
// //     await updateEvent(event.year, values);
// //     toast.success("Event updated successfully");
// //     onClose();
// //   }

// //   return (
// //     <Dialog open={open} onOpenChange={onClose}>
// //       <DialogContent className="!max-w-md w-[90vw]">
// //         <DialogHeader>
// //           <DialogTitle>Edit Event – {event.year}</DialogTitle>
// //         </DialogHeader>

// //         <Form {...form}>
// //           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
// //             <FormField
// //               control={form.control}
// //               name="theme"
// //               render={({ field }) => (
// //                 <FormItem>
// //                   <FormLabel>Event Theme</FormLabel>
// //                   <FormControl>
// //                     <Input {...field} />
// //                   </FormControl>
// //                   <FormMessage />
// //                 </FormItem>
// //               )}
// //             />

// //             <FormField
// //               control={form.control}
// //               name="startDate"
// //               render={({ field }) => (
// //                 <FormItem>
// //                   <FormLabel>Start Date</FormLabel>
// //                   <FormControl>
// //                     <Input type="date" {...field} />
// //                   </FormControl>
// //                   <FormMessage />
// //                 </FormItem>
// //               )}
// //             />

// //             <FormField
// //               control={form.control}
// //               name="endDate"
// //               render={({ field }) => (
// //                 <FormItem>
// //                   <FormLabel>End Date</FormLabel>
// //                   <FormControl>
// //                     <Input type="date" {...field} />
// //                   </FormControl>
// //                   <FormMessage />
// //                 </FormItem>
// //               )}
// //             />

// //             <Button
// //               type="submit"
// //               className="w-full"
// //               disabled={isEnded || !form.formState.isDirty}
// //             >
// //               Save Changes
// //             </Button>
// //           </form>
// //         </Form>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }

// // export default EditEventModal;

// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// import { updateEvent } from "@/app/api/event-actions";
// import { EventYear } from "@/app/api/event";
// import { editEventSchema } from "@/lib/event-form-schema";
// import { z } from "zod";

// // ✅ derive form values DIRECTLY from schema
// type EditEventFormValues = z.infer<typeof editEventSchema>;

// function EditEventModal({
//   event,
//   open,
//   onClose,
// }: {
//   event: EventYear;
//   open: boolean;
//   onClose: () => void;
// }) {
//   const isEnded = event.status === "Ended";

//   const form = useForm<EditEventFormValues>({
//     resolver: zodResolver(editEventSchema),
//     defaultValues: {
//       theme: event.theme,
//       startDate: event.startDate,
//       endDate: event.endDate,
//     },
//   });

//   async function onSubmit(values: EditEventFormValues) {
//     await updateEvent(event.year, values);
//     toast.success("Event updated successfully");
//     form.reset(values);
//     onClose();
//   }

//   if (isEnded) return null;

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="!max-w-md w-[90vw] p-0">
//         <DialogHeader className="px-6 pt-6">
//           <DialogTitle>Edit Event – {event.year}</DialogTitle>
//         </DialogHeader>

//         <div className="px-6 pb-6">
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
//               <FormField
//                 control={form.control}
//                 name="theme"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Event Theme</FormLabel>
//                     <FormControl>
//                       <Input {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="startDate"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Start Date</FormLabel>
//                     <FormControl>
//                       <Input type="date" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="endDate"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>End Date</FormLabel>
//                     <FormControl>
//                       <Input type="date" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={!form.formState.isDirty}
//               >
//                 Save Changes
//               </Button>
//             </form>
//           </Form>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default EditEventModal;
