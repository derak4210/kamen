/**
 * Rental policy and damage price list that guests e-sign before arrival.
 * Bump POLICY_VERSION whenever the wording or prices change: each signature stores the version it agreed to.
 * Placeholder wording and prices: have them checked by a Croatian lawyer before use,
 * and disclose the policy and deposit in both listings before booking.
 */
export const POLICY_VERSION = "2026-11-draft-1";

export const POLICY_RULES: string[] = [
  "Check-in from 15:00, checkout by 10:00 unless agreed otherwise.",
  "No smoking indoors, including the balcony door area.",
  "No parties or events. Quiet hours 22:00 to 07:00, as required by the building.",
  "Maximum occupancy as stated in the booking.",
  "Report any damage or breakage as soon as it happens.",
];

export const DAMAGE_PRICE_LIST: { item: string; priceEur: number }[] = [
  { item: "Lost apartment key or fob", priceEur: 50 },
  { item: "Broken glass, plate or mug (each)", priceEur: 5 },
  { item: "Stained or damaged towel or bed linen (each)", priceEur: 20 },
  { item: "Lost TV or AC remote", priceEur: 30 },
  { item: "Extra cleaning after smoking indoors", priceEur: 150 },
  { item: "Extra cleaning beyond normal use", priceEur: 60 },
];

export const POLICY_CONSENT =
  "I have read the house rules and damage price list. I agree that damage found at the checkout inspection may be charged at these prices, or at repair cost for items not listed, from my damage hold.";
