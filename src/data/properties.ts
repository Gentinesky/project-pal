// Re-export Property type from context for backwards compatibility
// and provide static filter options.
export type { Property } from "@/contexts/ListingsContext";

export const locations = [
  "All Locations",
  "Kilimani",
  "Roysambu",
  "South B",
  "Githurai",
  "Westlands",
  "Langata",
];

export const propertyTypes = [
  "All Types",
  "apartment",
  "bedsitter",
  "single-room",
  "house",
];
