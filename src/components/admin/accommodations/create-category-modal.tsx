"use client";

import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  createCategorySchema,
  CreateCategoryValues,
} from "@/features/admin/accommodation/schemas";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/features/admin/accommodation/server-actions";
import { AccommodationCategory } from "@/features/admin/accommodation/types";
import { Facility } from "@/features/admin/accommodation/types";

const facilities: Facility[] = [];

export function CreateCategoryModal({
  children,
  eventId,
  existingCategories,
  onCreated,
}: {
  children: ReactNode;
  eventId: string;
  existingCategories: AccommodationCategory[];
  onCreated?: () => void;
}) {
  const [inputValue, setInputValue] = useState("");
  //   const facilities: Facility[];

  const form = useForm<CreateCategoryValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      eventId: eventId || "",
      categories: [],
    },
  });

  // Ensure eventId is always synced + validated
  useEffect(() => {
    if (!eventId) return;

    form.setValue("eventId", eventId, {
      shouldValidate: true,
    });
  }, [eventId, form]);

  const categories = form.watch("categories");

  //   console.log(categories);

  function addCategory() {
    const name = inputValue.trim();

    if (!name) return;

    const normalizedName = name.toLowerCase();

    const existsInNew = categories.some(
      c => c.toLowerCase() === normalizedName,
    );

    // Check against categories already saved in backend
    const existsInExisting = existingCategories.some(
      c => c.name.trim().toLowerCase() === normalizedName,
    );

    if (existsInNew || existsInExisting) {
      toast.error("Category already exists");
      return;
    }

    form.setValue("categories", [...categories, name], {
      shouldValidate: true,
    });

    setInputValue("");
  }

  // Remove category safely + trigger validation
  function removeCategory(index: number) {
    form.setValue(
      "categories",
      categories.filter((_, i) => i !== index),
      { shouldValidate: true },
    );
  }

  //   async function handleDelete(categoryId: string) {
  //     const confirmed = confirm("Are you sure you want to delete this category?");

  //     if (!confirmed) return;

  //     try {
  //       await deleteCategoryAction(categoryId);
  //       toast.success("Category deleted");
  //       onCreated?.(); // reload categories
  //     } catch (err) {
  //       toast.error(
  //         err instanceof Error ? err.message : "Cannot delete category",
  //       );
  //     }
  //   }

  async function handleDelete(categoryId: string) {
    const categoryHasFacilities = facilities.some(
      f => f.accommodationCategoryId === categoryId,
    );

    if (categoryHasFacilities) {
      toast.error(
        "Cannot delete category. It is already assigned to one or more facilities.",
      );
      return;
    }

    const confirmed = confirm("Are you sure you want to delete this category?");

    if (!confirmed) return;

    try {
      await deleteCategoryAction(categoryId);

      toast.success("Category deleted");

      onCreated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cannot delete category",
      );
    }
  }

  async function onSubmit(values: CreateCategoryValues) {
    try {
      await createCategoryAction(values);

      toast.success("Categories created successfully");

      form.reset({
        eventId,
        categories: [],
      });

      setInputValue("");

      onCreated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create categories",
      );
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-md space-y-3">
        <DialogHeader className="text-left">
          <DialogTitle>Create Facility Categories</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Hidden eventId registration */}
            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => <input type="hidden" {...field} />}
            />

            {/* Add Category Input */}
            <FormItem>
              <FormLabel>Add Category</FormLabel>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Hostel"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value.toUpperCase())}
                />

                <Button type="button" onClick={addCategory} variant="outline">
                  Add
                </Button>
              </div>
            </FormItem>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
                >
                  {cat}
                  <button type="button" onClick={() => removeCategory(index)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Existing Categories</h4>

              {existingCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No categories created yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {existingCategories.map(category => (
                    <div
                      key={category.categoryId}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm"
                    >
                      {category.name}

                      <button
                        type="button"
                        onClick={() => handleDelete(category.categoryId)}
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Validation message for categories */}
            <FormField
              control={form.control}
              name="categories"
              render={() => <FormMessage />}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !eventId}
              className="w-full bg-brand-red hover:bg-brand-red/80"
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create Categories"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
