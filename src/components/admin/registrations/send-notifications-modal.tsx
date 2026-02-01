"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { sendNotificationSchema } from "@/lib/communication-schema";

type FormValues = z.infer<typeof sendNotificationSchema>;

function SendNotificationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      recipients: "all",
      title: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    // TODO: replace with server action
    console.log(values);

    toast.success("Notification sent successfully");
    onClose();
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl h-[90vh] flex flex-col pt-25">
        <DialogHeader>
          <DialogTitle className="text-left mb-8 text-4xl font-bold">
            Send Push Notification
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col justify-between"
          >
            <div className="overflow-y-auto pr-1 space-y-10">
              {/* Recipients */}
              <FormField
                control={form.control}
                name="recipients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-1">Recipients</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full border-slate-300">
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="">
                        <SelectItem value="all">All Participants</SelectItem>
                        <SelectItem value="campers">Campers</SelectItem>
                        <SelectItem value="non-campers">Non-Campers</SelectItem>
                        <SelectItem value="online">Online Attendees</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-1">Notification Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter notification title"
                        {...field}
                        className="border-slate-300"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      50 characters maximum
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-1">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Type your notification message"
                        {...field}
                        className="border-slate-300"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      200 characters maximum
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sticky footer */}
            <Button
              type="submit"
              className="mt-4 bg-brand-red hover:bg-brand-red/80"
            >
              Send Notification
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default SendNotificationModal;
