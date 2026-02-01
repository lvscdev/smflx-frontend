// "use client";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// const roomSchema = z.object({
//   roomName: z.string().min(1, "Room name is required"),
//   roomNo: z.string().min(1, "Room number is required"),
//   capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
//   gender: z.enum(["male", "female", "mixed"]),
// });

// export type RoomFormValues = z.infer<typeof roomSchema>;

// interface CreateRoomModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (values: RoomFormValues) => void;
//   defaultValues?: Partial<RoomFormValues>;
// }

// export function CreateRoomModal({
//   open,
//   onOpenChange,
//   onSubmit,
//   defaultValues,
// }: CreateRoomModalProps) {
//   const form = useForm<RoomFormValues>({
//     resolver: zodResolver(roomSchema),
//     defaultValues,
//   });

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>Create New Room</DialogTitle>
//         </DialogHeader>

//         <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label>Room Name</Label>
//               <Input
//                 {...form.register("roomName")}
//                 placeholder="Enter room name"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Room No</Label>
//               <Input {...form.register("roomNo")} placeholder="Enter room no" />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label>Capacity</Label>
//             <Input type="number" {...form.register("capacity")} />
//           </div>

//           <div className="space-y-2">
//             <Label>Gender Restriction</Label>
//             <Select
//               onValueChange={value => form.setValue("gender", value as any)}
//               defaultValue={defaultValues?.gender}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Choose gender" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="male">Male</SelectItem>
//                 <SelectItem value="female">Female</SelectItem>
//                 <SelectItem value="mixed">Mixed</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex justify-end gap-2 pt-4">
//             <Button
//               type="button"
//               variant="secondary"
//               onClick={() => onOpenChange(false)}
//             >
//               Cancel
//             </Button>
//             <Button type="submit">Create Room</Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roomSchema = z.object({
  roomName: z.string().min(1),
  roomNo: z.string().min(1),
  capacity: z.preprocess(val => Number(val), z.number().min(1)),
  gender: z.enum(["male", "female", "mixed"]),
});

type RoomFormInput = z.input<typeof roomSchema>;
export type RoomFormValues = z.infer<typeof roomSchema>;

export function CreateRoomModal({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: RoomFormValues) => void;
  defaultValues?: Partial<RoomFormValues>;
}) {
  const form = useForm<RoomFormInput>({
    resolver: zodResolver(roomSchema),
    defaultValues,
  });

  const handleSubmitForm: SubmitHandler<RoomFormInput> = values => {
    const parsed = roomSchema.parse(values);
    onSubmit(parsed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? "Edit Room" : "Create Room"}
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(handleSubmitForm)}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Room Name</Label>
              <Input {...form.register("roomName")} />
            </div>
            <div className="space-y-2">
              <Label>Room No</Label>
              <Input {...form.register("roomNo")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Capacity</Label>
            <Input type="number" {...form.register("capacity")} />
          </div>

          <div className="space-y-2">
            <Label>Gender Restriction</Label>
            <Select
              defaultValue={defaultValues?.gender}
              onValueChange={value => form.setValue("gender", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
