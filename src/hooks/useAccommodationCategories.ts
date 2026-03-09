import { useEffect, useState } from "react";
import { listAccommodationCategories } from "@/lib/api/accommodation";
import { AccommodationCategories } from "@/lib/api/accommodation/types";
import { toUserMessage } from "@/lib/errors";

interface UseAccommodationCategoriesResult {
  accommodationCategories: AccommodationCategories[];
  loadingAccommodations: boolean;
  loadError: string;
}

export function useAccommodationCategories(
  eventId?: string | null
): UseAccommodationCategoriesResult {
  const [accommodationCategories, setAccommodationCategories] = useState<
    AccommodationCategories[]
  >([]);
  const [loadingAccommodations, setLoadingAccommodations] = useState(false);
  const [loadError, setLoadError] = useState<string>("");

  useEffect(() => {
    async function loadAccommodations() {
      setLoadingAccommodations(true);
      try {
        if (!eventId) {
          throw new Error("Missing eventId for accommodation categories");
        }
        const data = await listAccommodationCategories({ eventId });
        setAccommodationCategories(data);
      } catch (error) {
        setLoadError(
          toUserMessage(error, { feature: "events", action: "list" })
        );
      } finally {
        setLoadingAccommodations(false);
      }
    }

    loadAccommodations();
  }, [eventId]);

  return { accommodationCategories, loadingAccommodations, loadError };
}