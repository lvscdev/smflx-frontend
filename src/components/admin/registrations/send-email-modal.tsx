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

import { sendEmailSchema } from "@/lib/communication-schema";

type FormValues = z.infer<typeof sendEmailSchema>;

export default function SendEmailModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: {
      recipients: "all",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    // TODO: replace with server action
    console.log(values);

    toast.success("Email sent successfully");
    onClose();
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-3xl h-[90vh] flex flex-col pt-25">
        <DialogHeader>
          <DialogTitle className="text-left mb-8 text-4xl font-bold">
            Send Email to Participants
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col justify-between"
          >
            <div className="space-y-10 overflow-y-auto pr-1">
              {/* Recipients */}
              <FormField
                control={form.control}
                name="recipients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipients</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full border-slate-300">
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

              {/* Subject */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email subject"
                        {...field}
                        className="border-slate-300"
                      />
                    </FormControl>
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
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Type your email message"
                        {...field}
                        className="border-slate-300"
                      />
                    </FormControl>
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
              Send Email
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
