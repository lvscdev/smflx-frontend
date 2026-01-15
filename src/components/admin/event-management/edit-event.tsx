"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateEvent } from "@/app/api/event-actions";
import { EventYear } from "@/app/api/event";

const schema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

function EditEventDrawer({
  event,
  open,
  onClose,
}: {
  event: EventYear;
  open: boolean;
  onClose: () => void;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: event,
  });

  async function onSubmit(values: any) {
    await updateEvent(event.year, values);
    toast.success("Event updated");
    onClose();
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>Edit Event – {event.year}</DrawerHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
          <Input type="date" {...form.register("startDate")} />
          <Input type="date" {...form.register("endDate")} />
          <Button type="submit">Save Changes</Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

export { EditEventDrawer };
