/**
 * Guidebook content. English is the source; other languages are added in Phase 2
 * (auto-translated, then reviewed). Secrets such as the Wi-Fi password come from
 * environment variables, never from this file, because the repository is public.
 */

export type Section = {
  id: string;
  title: string;
  body: string[];
  links?: { label: string; href: string }[];
};

export const GUIDEBOOK_EN: Section[] = [
  {
    id: "arrival",
    title: "Arrival and check-in",
    body: [
      "Check-in is from 15:00. You'll get the door code in your pre-check-in link once registration is complete.",
      "TODO: step-by-step directions from the Riva and from the bus and ferry terminal, with photos of the entrance.",
    ],
  },
  {
    id: "parking",
    title: "Parking",
    body: [
      "The Old Town is pedestrian-only. TODO: nearest public garage, price per day, and how to pay.",
    ],
  },
  {
    id: "rules",
    title: "House rules",
    body: [
      "No smoking indoors. No parties. Quiet hours 22:00 to 07:00.",
      "Please separate recycling: TODO bins location and colours.",
    ],
  },
  {
    id: "appliances",
    title: "Appliances",
    body: ["TODO: air conditioning, washing machine, TV and hob instructions."],
  },
  {
    id: "ferries",
    title: "Islands and ferries",
    body: [
      "Ferries and catamarans to Hvar, Brač and Vis leave from the port next to the bus station. Book summer catamarans a day or two ahead.",
    ],
    links: [
      { label: "Jadrolinija timetable", href: "https://www.jadrolinija.hr/en" },
      { label: "Krilo catamarans", href: "https://www.krilo.hr/en" },
    ],
  },
  {
    id: "beaches",
    title: "Beaches",
    body: [
      "Bačvice is the closest sandy beach and gets crowded in July and August. For quieter swimming, walk or cycle through Marjan park to Kašjuni or Bene.",
    ],
  },
  {
    id: "day-trips",
    title: "Day trips",
    body: [
      "Krka National Park and Trogir make an easy day. Plitvice is a long day by car or tour.",
      "TODO: your recommended tour operators.",
    ],
  },
  {
    id: "winter",
    title: "Split in the quiet season",
    body: [
      "From November to March the palace is calm and locals take back the Riva. Advent in Split runs through December.",
      "TODO: restaurants and cafés that stay open in winter.",
    ],
  },
  {
    id: "checkout",
    title: "Checkout",
    body: [
      "Checkout is by 10:00. Please leave keys on the table, close windows and switch off the air conditioning.",
    ],
  },
  {
    id: "emergency",
    title: "Emergency",
    body: ["Emergency number: 112. Nearest hospital: KBC Split (Firule)."],
  },
];
