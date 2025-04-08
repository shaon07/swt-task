import type { FilterState } from "@/types";

export const initialFilterState: FilterState = {
  categories: [],
  brands: [],
  priceRanges: [],
  ratings: [],
  features: [],
  availability: [],
  releaseDates: [],
};

export function initialFilterStateMap(type: string): keyof FilterState {
  switch (type) {
    case "category":
      return "categories";
    case "brand":
      return "brands";
    case "price":
      return "priceRanges";
    case "rating":
      return "ratings";
    case "feature":
      return "features";
    case "availability":
      return "availability";
    case "releaseDate":
      return "releaseDates";
    default:
      return "categories";
  }
}
